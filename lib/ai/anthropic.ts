import Anthropic from "@anthropic-ai/sdk";

const key = process.env.ANTHROPIC_API_KEY;

/** Lazy client — module loads without the env so the build doesn't crash;
 * any real call without an API key returns an obvious error. */
export const anthropic = new Anthropic({ apiKey: key || "sk-ant-placeholder" });

export const ANTHROPIC_CONFIGURED = Boolean(key);

/** Sonnet is the workhorse: quality matters for proposals and contracts. */
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

/** Extract concatenated text from a Claude messages.create response. */
export function extractText(resp: Anthropic.Messages.Message): string {
  return resp.content
    .filter((c): c is Anthropic.Messages.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("");
}

/** Strip an optional ```json fence and parse. Throws on bad JSON. */
export function parseJsonBlock<T>(text: string): T {
  const cleaned = text
    .replace(/^[^[{]*?(```(?:json)?\s*)?/, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
