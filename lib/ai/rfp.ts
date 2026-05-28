import { anthropic, MODEL, extractText, parseJsonBlock } from "./anthropic";
import type { KnowledgeEntryRow, RfpAnswer, WorkspaceRow } from "@/lib/db/schema";

interface RfpInput {
  workspace: Pick<WorkspaceRow, "companyName" | "industry" | "defaultTone" | "services" | "clientType">;
  knowledge: KnowledgeEntryRow[];
  questions: string[];
}

const SYSTEM = `You answer questions from RFPs and security questionnaires.

Rules — never break them:
1. Ground every answer in the provided knowledge base. Quote facts that appear there; do not invent.
2. If no entry supports the answer, set "confidence" to "low" and "sourceEntryId" to null. Write a short note in the answer field explaining what is missing (e.g. "No SOC 2 information in the knowledge base — please review before sending").
3. Match the workspace's default tone (formal / friendly / concise).
4. Keep answers concise unless the question demands detail. RFP reviewers skim — be direct.
5. Pick the single best source entry. If multiple entries are relevant, pick the one whose body most directly answers the question.

Return ONLY a JSON array. No commentary, no markdown fences. Each element must have exactly:
  { "question": "<original question, verbatim>",
    "answer": "<your answer>",
    "confidence": "high" | "medium" | "low",
    "sourceEntryId": "<id of the source entry, or null>" }
`;

export async function answerRfp({ workspace, knowledge, questions }: RfpInput): Promise<RfpAnswer[]> {
  const profile = [
    `Company: ${workspace.companyName || "(not provided)"}`,
    `Industry: ${workspace.industry || "(not provided)"}`,
    `Typical client: ${workspace.clientType || "(not provided)"}`,
    `Services: ${workspace.services.join(", ") || "(not provided)"}`,
    `Tone: ${workspace.defaultTone}`,
  ].join("\n");

  const kbBlock = knowledge.length
    ? knowledge
        .map(
          (k) =>
            `### Entry ${k.id} — ${k.title}\nTags: ${k.tags.join(", ") || "(none)"}\n${k.body}`,
        )
        .join("\n\n")
    : "(empty)";

  const userBlock = `Answer each of the following questions, in order. Return the JSON array described in the system prompt.\n\n${questions
    .map((q, i) => `${i + 1}. ${q}`)
    .join("\n")}`;

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [
      { type: "text", text: SYSTEM },
      {
        // Cached: workspace profile + KB rarely change between calls in a session.
        type: "text",
        text: `Workspace profile:\n${profile}\n\nKnowledge base:\n${kbBlock}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userBlock }],
  });

  type RawAnswer = { question: string; answer: string; confidence: "high" | "medium" | "low"; sourceEntryId: string | null };
  const raw = parseJsonBlock<RawAnswer[]>(extractText(resp));

  // Defensive normalisation
  return raw.map((a, i) => ({
    question: a.question ?? questions[i] ?? "",
    answer: a.answer ?? "",
    confidence: a.confidence === "high" || a.confidence === "medium" || a.confidence === "low" ? a.confidence : "low",
    sourceEntryId: a.sourceEntryId && knowledge.some((k) => k.id === a.sourceEntryId) ? a.sourceEntryId : null,
    approved: false,
  }));
}
