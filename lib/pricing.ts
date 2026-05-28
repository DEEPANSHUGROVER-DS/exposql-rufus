/**
 * Pricing & credit model — single source of truth for the marketing pricing
 * page and the in-app credit displays.
 *
 * Principle: nothing is unlimited. Every AI action spends credits, and the
 * credit price always sits well above the underlying token cost so margin is
 * structural, not hoped-for. See PRICING.md for the full strategy and the
 * token-cost assumptions behind these numbers.
 */

/** What we charge a customer for one credit, by purchase route (USD). */
export const CREDIT_PRICE_USD = {
  /** Effective per-credit price inside a subscription allowance. */
  subscription: 0.0975,
  /** Headline pack price per credit (smallest pack). */
  packHigh: 0.15,
  /** Best pack price per credit (largest pack). */
  packLow: 0.0995,
} as const;

/**
 * Our estimated token cost to fulfil one credit of work, worst-case, including
 * retries and overhead. Charged credit price is ~8-12x this, so gross margin on
 * AI spend stays ~85%+ even on the cheapest actions.
 */
export const CREDIT_COGS_USD = 0.012;

export interface Plan {
  key: "free" | "starter" | "growth" | "scale";
  name: string;
  tagline: string;
  priceMonthly: number | null;
  includedCredits: number;
  note: string;
  features: string[];
  featured: boolean;
  /** Stripe price ID for paid plans (null for Free). */
  stripePriceKey: "starter" | "growth" | "scale" | null;
}

export const plans: Plan[] = [
  {
    key: "free",
    name: "Free",
    tagline: "Try one task",
    priceMonthly: 0,
    includedCredits: 20,
    note: "One-time · outputs watermarked",
    features: [
      "Try one proposal OR one contract review",
      "Manual editing always free",
      "Knowledge base up to 3 entries",
    ],
    featured: false,
    stripePriceKey: null,
  },
  {
    key: "starter",
    name: "Starter",
    tagline: "For solo operators",
    priceMonthly: 39,
    includedCredits: 400,
    note: "400 credits / month",
    features: [
      "All three tools",
      "400 AI credits each month",
      "PDF & DOCX export",
      "Manual editing free",
    ],
    featured: true,
    stripePriceKey: "starter",
  },
  {
    key: "growth",
    name: "Growth",
    tagline: "For teams sending often",
    priceMonthly: 99,
    includedCredits: 1200,
    note: "1,200 credits / month",
    features: [
      "Everything in Starter",
      "Brand kit & hosted proposal links",
      "Full knowledge base",
      "1,200 AI credits each month",
    ],
    featured: false,
    stripePriceKey: "growth",
  },
  {
    key: "scale",
    name: "Scale",
    tagline: "For high-volume teams",
    priceMonthly: 249,
    includedCredits: 3500,
    note: "3,500 credits / month",
    features: [
      "Everything in Growth",
      "3,500 AI credits each month",
      "Priority generation queue",
      "Shared workspace seats",
    ],
    featured: false,
    stripePriceKey: "scale",
  },
];

export interface CreditPack {
  key: "pack100" | "pack300" | "pack750" | "pack2000";
  credits: number;
  price: number;
}

/** Packs never expire. Per-credit price stays above the subscription rate so
 * recurring plans remain the better value. */
export const creditPacks: CreditPack[] = [
  { key: "pack100", credits: 100, price: 15 },
  { key: "pack300", credits: 300, price: 39 },
  { key: "pack750", credits: 750, price: 89 },
  { key: "pack2000", credits: 2000, price: 199 },
];

export interface ActionCost {
  key: string;
  label: string;
  min: number;
  max: number;
  unit?: string;
  note: string;
}

/** Credit cost shown as a range BEFORE an action runs; actual is deducted
 * after. Every range is set above token cost to preserve margin. */
/** Credit cost shown as a range BEFORE an action runs; actual is deducted
 * after. Every range is set above token cost to preserve margin. Reruns and
 * context-grounded actions are priced to cover the read + analysis + write,
 * not just the write — cached context is cheaper than a cold pass but not
 * free. */
export const actionCosts: ActionCost[] = [
  { key: "proposal", label: "Generate a proposal", min: 12, max: 20, note: "By output length" },
  { key: "proposalSection", label: "Regenerate one section", min: 4, max: 6, note: "Reads profile + existing draft, then regenerates" },
  { key: "rfpQuestion", label: "Answer an RFP question", min: 2, max: 4, unit: "/ question", note: "Data recall + analysis + tone (fresh or re-answer)" },
  { key: "contract", label: "Review a contract", min: 10, max: 30, note: "By document length" },
  { key: "contractFollowup", label: "Ask a follow-up about a contract", min: 3, max: 5, note: "Uses the cached contract — read + analyse + answer" },
  { key: "contractAction", label: "Re-run a contract section", min: 5, max: 8, note: "Re-analyse with the contract still cached" },
  { key: "knowledgeImport", label: "AI import to knowledge base", min: 2, max: 2, unit: "/ entry", note: "Splits + structures each entry with tags" },
  { key: "editorAssist", label: "Editor assistant (side panel)", min: 2, max: 4, note: "Recalls the document, then answers in tone" },
  { key: "inlineEdit", label: "Inline AI edit (rewrite, shorten…)", min: 1, max: 1, note: "On selected text, no recall" },
];

export function costByKey(key: string): ActionCost | undefined {
  return actionCosts.find((a) => a.key === key);
}

/** Credits to answer a single RFP question — varies by length & complexity,
 * since the model has to recall from the knowledge base, pick the right
 * source, and write a tone-matched answer. */
export function rfpQuestionCost(question: string): number {
  const len = question.trim().length;
  if (len > 180) return 4;
  if (len > 80) return 3;
  return 2;
}

/** Credits to regenerate a single proposal section. Sections that recall
 * more deeply (scope, deliverables, pricing) cost more than light sections
 * (terms, next steps). */
const HEAVY_SECTIONS = new Set(["Scope of work", "Deliverables", "Pricing"]);
const LIGHT_SECTIONS = new Set(["Terms", "Next steps"]);
export function proposalSectionCost(section: string): number {
  if (HEAVY_SECTIONS.has(section)) return 6;
  if (LIGHT_SECTIONS.has(section)) return 4;
  return 5;
}

/** Credits to AI-import a paste into structured knowledge entries —
 * roughly 2 credits per detected entry (read + split + tag). */
export function knowledgeImportCost(entryCount: number): number {
  return Math.max(2, entryCount * 2);
}

/** "12–20 credits" / "1 credit" formatting. */
export function creditRange(min: number, max: number, unit?: string): string {
  const body = min === max ? `${min} credit${min === 1 ? "" : "s"}` : `${min}–${max} credits`;
  return unit ? `${body} ${unit}` : body;
}

export function packPerCredit(pack: CreditPack): number {
  return pack.price / pack.credits;
}
