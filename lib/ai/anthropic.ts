import Anthropic from "@anthropic-ai/sdk";

const key = process.env.ANTHROPIC_API_KEY;

/** Lazy client — module loads without the env so the build doesn't crash;
 * any real call without an API key returns an obvious error. */
export const anthropic = new Anthropic({ apiKey: key || "sk-ant-placeholder" });

export const ANTHROPIC_CONFIGURED = Boolean(key);

/**
 * Model allowlist — Opus is intentionally **excluded** because it costs
 * 5x Sonnet and we can't sustain that on credit-priced output.
 *
 * If ANTHROPIC_MODEL is set to anything outside this list, we ignore it
 * and fall back to Sonnet, logging a warning. This is a hard guard — even
 * an accidental "claude-opus-…" string in env can't make it into a real
 * API call.
 */
const ALLOWED_MODELS = new Set<string>([
  "claude-sonnet-4-6",
  "claude-sonnet-4-5",
  "claude-haiku-4-5",
  "claude-haiku-4-5-20251001",
]);
const DEFAULT_MODEL = "claude-sonnet-4-6";

function resolveModel(): string {
  const requested = process.env.ANTHROPIC_MODEL?.trim();
  if (!requested) return DEFAULT_MODEL;
  if (ALLOWED_MODELS.has(requested)) return requested;
  if (requested.toLowerCase().includes("opus")) {
    // eslint-disable-next-line no-console
    console.warn(
      `[Rufus AI] Ignoring ANTHROPIC_MODEL="${requested}" — Opus is not allowed. Falling back to ${DEFAULT_MODEL}.`,
    );
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      `[Rufus AI] ANTHROPIC_MODEL="${requested}" not in allowlist (Sonnet/Haiku only). Falling back to ${DEFAULT_MODEL}.`,
    );
  }
  return DEFAULT_MODEL;
}

export const MODEL = resolveModel();

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
