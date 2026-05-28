import { anthropic, MODEL, extractText, parseJsonBlock } from "./anthropic";

interface ImportEntry {
  title: string;
  body: string;
  tags: string[];
}

const SYSTEM = `You are converting an unstructured paste from a user into a clean set of knowledge-base entries.

Rules:
1. Split the paste into self-contained entries. Each entry should answer one topic — security, hosting, pricing approach, SLA, etc.
2. Each entry has:
   - "title": short, like a section header. 60 characters max.
   - "body": the content for that topic, in clear prose. Preserve specific facts (numbers, names, jurisdictions, time periods) exactly as the user wrote them.
   - "tags": 1–4 lowercase keywords. Use natural categories like "security", "compliance", "pricing", "company", "sla", "hr", "ops".
3. Do not invent facts. If a topic spans only a sentence in the input, keep the entry short. Don't pad.
4. Skip noise — boilerplate emails, signatures, "thanks!" sign-offs, etc.

Return ONLY a JSON array of entries — no commentary, no markdown fences.`;

export async function splitIntoEntries(text: string): Promise<ImportEntry[]> {
  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: [{ type: "text", text: SYSTEM }],
    messages: [
      { role: "user", content: `Paste:\n----\n${text}\n----\n\nReturn the JSON array.` },
    ],
  });

  const raw = parseJsonBlock<Partial<ImportEntry>[]>(extractText(resp));
  return raw
    .filter((e): e is ImportEntry => !!e && typeof e === "object" && typeof e.title === "string")
    .map((e) => ({
      title: String(e.title).slice(0, 80).trim(),
      body: String(e.body ?? "").trim(),
      tags: Array.isArray(e.tags)
        ? e.tags
            .map((t) => String(t).toLowerCase().trim())
            .filter((t) => t.length > 0 && t.length < 30)
            .slice(0, 6)
        : ["imported"],
    }))
    .filter((e) => e.title);
}
