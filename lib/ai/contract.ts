import { anthropic, MODEL, extractText, parseJsonBlock } from "./anthropic";
import type { RedFlag, SuggestedEdit } from "@/lib/db/schema";

interface ContractInput {
  contractText: string;
  fileName?: string;
}

export interface ContractReviewOutput {
  summary: string[];
  redFlags: RedFlag[];
  suggestedEdits: SuggestedEdit[];
}

const SYSTEM = `You review business contracts in plain English. You are NOT a lawyer and you do not give legal advice — every output is for the reader's own review.

Rules:
1. Plain language. No legalese unless quoting the contract directly.
2. Quote clauses verbatim when you flag them. Use the exact wording.
3. Rank red flags by severity (high / medium / low). High = unbounded liability, auto-renewals with long notice burdens, one-sided termination, broad IP assignment, payment terms with no caps. Medium = ambiguous obligations, inconvenient jurisdiction. Low = minor stylistic concerns.
4. Suggested edits propose specific replacement language, with a one-line reason.
5. Be concise. Summary = 3 to 6 bullet points covering the parts that matter to a non-lawyer signing this contract.
6. Never recommend "consult a lawyer" as the entire answer. Do the analysis; the reader will decide whether they need counsel.

Return ONLY a JSON object with this exact shape — no commentary, no markdown fences:
{
  "summary": ["..."],
  "redFlags": [
    { "severity": "high" | "medium" | "low",
      "clause": "<verbatim quote from the contract>",
      "reason": "<why this is a concern in one sentence>" }
  ],
  "suggestedEdits": [
    { "original": "<verbatim phrase from the contract>",
      "replacement": "<proposed replacement>",
      "reason": "<one-line reason>" }
  ]
}`;

export async function reviewContract({ contractText, fileName }: ContractInput): Promise<ContractReviewOutput> {
  const userBlock = [
    fileName ? `Filename: ${fileName}` : null,
    "",
    "Contract text begins below the line.",
    "----",
    contractText,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [{ type: "text", text: SYSTEM }],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userBlock,
            // Cached: makes contract follow-ups (3-5cr) actually cheap on tokens.
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: "Review the contract above and return the JSON object described in the system prompt.",
          },
        ],
      },
    ],
  });

  const raw = parseJsonBlock<Partial<ContractReviewOutput>>(extractText(resp));

  const summary = Array.isArray(raw.summary) ? raw.summary.filter((s) => typeof s === "string") : [];
  const redFlags: RedFlag[] = Array.isArray(raw.redFlags)
    ? raw.redFlags
        .filter((f): f is RedFlag => !!f && typeof f === "object")
        .map((f) => ({
          severity: (f.severity === "high" || f.severity === "medium" ? f.severity : "low") as RedFlag["severity"],
          clause: String(f.clause ?? ""),
          reason: String(f.reason ?? ""),
        }))
    : [];
  const suggestedEdits = Array.isArray(raw.suggestedEdits)
    ? raw.suggestedEdits
        .filter((e): e is SuggestedEdit => !!e && typeof e === "object")
        .map((e) => ({
          original: String(e.original ?? ""),
          replacement: String(e.replacement ?? ""),
          reason: String(e.reason ?? ""),
        }))
    : [];

  return { summary, redFlags, suggestedEdits };
}

const FOLLOWUP_SYSTEM = `You answer follow-up questions about a contract that has been provided as context.

Rules:
1. Answer only from what the contract actually says. If the contract is silent, say so plainly.
2. Plain English, no legalese unless quoting the contract.
3. 1–3 short paragraphs maximum.
4. Never give legal advice. End your answer (only when relevant) with a one-line "For your review" reminder.

Return your answer as plain text — no JSON, no markdown fences.`;

/**
 * Re-run one part of a contract review against a stricter or fresh lens.
 * Returns only the requested section. Cached against the contract text so
 * it stays cheap (5-8cr range vs 10-30 for a fresh full review).
 */
export type ContractSection = "summary" | "flags" | "edits";

export async function rerunContractSection({
  contractText,
  section,
  instruction,
}: {
  contractText: string;
  section: ContractSection;
  /** Optional extra instruction — e.g. "rewrite all edits in a stricter tone". */
  instruction?: string;
}): Promise<Partial<ContractReviewOutput>> {
  const sectionSystem: Record<ContractSection, string> = {
    summary:
      "Re-summarise the contract in plain English. Return ONLY a JSON object: { \"summary\": [\"...\", \"...\"] }. 3-6 bullets.",
    flags:
      "Re-analyse the contract for red flags. Be thorough and rank by severity. Return ONLY a JSON object: { \"redFlags\": [{ \"severity\": \"high|medium|low\", \"clause\": \"<verbatim>\", \"reason\": \"<one sentence>\" }] }.",
    edits:
      "Propose concrete edits to the contract. Each edit shows the original phrase, a replacement, and a one-line reason. Return ONLY a JSON object: { \"suggestedEdits\": [{ \"original\": \"...\", \"replacement\": \"...\", \"reason\": \"...\" }] }.",
  };

  const system = `You are re-analysing a contract that has been provided as context. ${sectionSystem[section]} ${
    instruction ? `Additional instruction: ${instruction}.` : ""
  } Never give legal advice. No commentary, no markdown fences.`;

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: [{ type: "text", text: system }],
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `Contract text:\n----\n${contractText}`, cache_control: { type: "ephemeral" } },
          { type: "text", text: `Return the JSON object for the "${section}" section.` },
        ],
      },
    ],
  });

  const raw = parseJsonBlock<Partial<ContractReviewOutput>>(extractText(resp));

  if (section === "summary") {
    return { summary: Array.isArray(raw.summary) ? raw.summary.filter((s) => typeof s === "string") : [] };
  }
  if (section === "flags") {
    return {
      redFlags: Array.isArray(raw.redFlags)
        ? raw.redFlags
            .filter((f): f is RedFlag => !!f && typeof f === "object")
            .map((f) => ({
              severity: (f.severity === "high" || f.severity === "medium" ? f.severity : "low") as RedFlag["severity"],
              clause: String(f.clause ?? ""),
              reason: String(f.reason ?? ""),
            }))
        : [],
    };
  }
  return {
    suggestedEdits: Array.isArray(raw.suggestedEdits)
      ? raw.suggestedEdits
          .filter((e): e is SuggestedEdit => !!e && typeof e === "object")
          .map((e) => ({
            original: String(e.original ?? ""),
            replacement: String(e.replacement ?? ""),
            reason: String(e.reason ?? ""),
          }))
      : [],
  };
}

export async function askContractFollowup({
  contractText,
  question,
}: {
  contractText: string;
  question: string;
}): Promise<string> {
  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [{ type: "text", text: FOLLOWUP_SYSTEM }],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Contract text:\n----\n${contractText}`,
            cache_control: { type: "ephemeral" },
          },
          { type: "text", text: `Question: ${question}` },
        ],
      },
    ],
  });
  return extractText(resp).trim();
}
