import { anthropic, MODEL, extractText, parseJsonBlock } from "./anthropic";
import type { KnowledgeEntryRow, WorkspaceRow } from "@/lib/db/schema";

export const PROPOSAL_SECTION_KEYS = [
  "Overview",
  "Objectives",
  "Scope of work",
  "Deliverables",
  "Timeline",
  "Terms",
  "Next steps",
] as const;
export type ProposalSectionKey = (typeof PROPOSAL_SECTION_KEYS)[number];

interface ProposalInput {
  workspace: Pick<WorkspaceRow, "companyName" | "industry" | "defaultTone" | "services" | "currency">;
  knowledge?: KnowledgeEntryRow[];
  client: string;
  title: string;
  scope: string;
  timeline?: string;
  pricingRows: { item: string; qty: number; price: number }[];
  tone: string;
  /** Restrict to one section (used for "regenerate this section"). */
  regenSectionOnly?: ProposalSectionKey;
}

const SYSTEM = `You draft client proposals and statements of work.

Rules:
1. Write in the tone provided. Default to friendly-professional if unspecified.
2. Refer to the workspace's company by name. Be specific about services where it helps the client trust you.
3. Never invent numbers, dates, or commitments not present in the inputs. If a detail is missing (e.g. timeline), say so plainly rather than fabricating.
4. Keep each section tight: 2–4 short paragraphs or a focused bulleted list. Clients skim.
5. Do NOT include a pricing table in your output — it is rendered separately from the line items provided. You may reference the total figure if it helps.

Return ONLY a JSON object mapping section names to strings. Use these exact keys, in this order:
  "Overview", "Objectives", "Scope of work", "Deliverables", "Timeline", "Terms", "Next steps"

No commentary, no markdown fences. Plain text inside each section (newlines and "- " for bullets are fine).`;

const SECTION_PROMPT = (section: ProposalSectionKey) =>
  `Return ONLY a JSON object with one key "${section}" whose value is the rewritten section text. No commentary, no markdown fences.`;

export async function generateProposal(input: ProposalInput): Promise<Record<ProposalSectionKey, string>> {
  const { workspace, knowledge = [], client, title, scope, timeline, pricingRows, tone, regenSectionOnly } = input;
  const total = pricingRows.reduce((s, r) => s + r.qty * r.price, 0);

  const profile = [
    `Company: ${workspace.companyName || "(not provided)"}`,
    `Industry: ${workspace.industry || "(not provided)"}`,
    `Services: ${workspace.services.join(", ") || "(not provided)"}`,
    `Currency: ${workspace.currency}`,
    `Default tone: ${workspace.defaultTone}`,
  ].join("\n");

  const kbBlock = knowledge.length
    ? knowledge
        .map((k) => `### ${k.title}\n${k.body}`)
        .join("\n\n")
    : "";

  const projectBlock = [
    `Client: ${client}`,
    `Project title: ${title}`,
    `Tone for this proposal: ${tone}`,
    "",
    "Scope and deliverables (raw notes from the user):",
    scope || "(not provided)",
    "",
    `Timeline: ${timeline || "(not provided)"}`,
    "",
    "Pricing line items (rendered separately, but you may reference the total):",
    pricingRows.map((r) => `- ${r.item} x${r.qty} @ ${r.price} ${workspace.currency}`).join("\n"),
    `Total: ${total} ${workspace.currency}`,
  ].join("\n");

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [
      { type: "text", text: regenSectionOnly ? SECTION_PROMPT(regenSectionOnly) : SYSTEM },
      {
        // Cached: workspace profile + KB stable across regenerations in this session.
        type: "text",
        text: `Workspace profile:\n${profile}${kbBlock ? `\n\nReusable company knowledge:\n${kbBlock}` : ""}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: projectBlock }],
  });

  const raw = parseJsonBlock<Partial<Record<ProposalSectionKey, string>>>(extractText(resp));
  const sections = {} as Record<ProposalSectionKey, string>;
  for (const k of PROPOSAL_SECTION_KEYS) sections[k] = raw[k] ?? "";
  return sections;
}
