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
  key: string;
  name: string;
  tagline: string;
  priceMonthly: number | null; // null = custom/contact
  includedCredits: number;
  note: string;
  features: string[];
  featured: boolean;
}

export const plans: Plan[] = [
  {
    key: "free",
    name: "Free",
    tagline: "Try one of each",
    priceMonthly: 0,
    includedCredits: 30,
    note: "One-time credits · outputs watermarked",
    features: [
      "One proposal, one RFP, one contract review",
      "Manual editing always free",
      "Knowledge base up to 5 entries",
    ],
    featured: false,
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
  },
];

export interface CreditPack {
  credits: number;
  price: number;
}

/** Packs never expire. Per-credit price stays above the subscription rate so
 * recurring plans remain the better value. */
export const creditPacks: CreditPack[] = [
  { credits: 100, price: 15 },
  { credits: 300, price: 39 },
  { credits: 750, price: 89 },
  { credits: 2000, price: 199 },
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
export const actionCosts: ActionCost[] = [
  { key: "proposal", label: "Generate a proposal", min: 12, max: 20, note: "By output length" },
  { key: "proposalSection", label: "Regenerate one section", min: 3, max: 5, note: "Smaller than a full draft" },
  { key: "rfpQuestion", label: "Answer an RFP question", min: 1, max: 1, unit: "/ question", note: "Roughly one credit each" },
  { key: "contract", label: "Review a contract", min: 10, max: 30, note: "By document length" },
  { key: "contractAction", label: "Re-run a contract section", min: 5, max: 8, note: "Cheap — contract is cached" },
  { key: "inlineEdit", label: "Inline AI edit (rewrite, shorten…)", min: 1, max: 1, note: "On selected text" },
];

export function costByKey(key: string): ActionCost | undefined {
  return actionCosts.find((a) => a.key === key);
}

/** "12–20 credits" / "1 credit" formatting. */
export function creditRange(min: number, max: number, unit?: string): string {
  const body = min === max ? `${min} credit${min === 1 ? "" : "s"}` : `${min}–${max} credits`;
  return unit ? `${body} ${unit}` : body;
}

export function packPerCredit(pack: CreditPack): number {
  return pack.price / pack.credits;
}
