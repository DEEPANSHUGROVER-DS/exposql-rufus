import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

/** Lazy client — module loads cleanly even without the env, but any call
 * against the unconfigured client will fail at request time. */
export const stripe = new Stripe(key || "sk_placeholder_missing", {
  apiVersion: "2026-05-27.dahlia",
});

export const STRIPE_CONFIGURED = Boolean(key);

/**
 * Live Stripe price IDs for the Exposql Checklist account (acct_1TZu9cDs5O82YiC2).
 * Set via env in case you want to swap to test-mode IDs in non-prod
 * environments.
 */
export const stripePrices = {
  starter: process.env.STRIPE_PRICE_STARTER || "price_1TbysLDs5O82YiC2rqsujnfC",
  growth: process.env.STRIPE_PRICE_GROWTH || "price_1TbysMDs5O82YiC2CZ8E0FBs",
  scale: process.env.STRIPE_PRICE_SCALE || "price_1TbysMDs5O82YiC29g1ZgPS3",
  pack100: process.env.STRIPE_PRICE_PACK_100 || "price_1TbysNDs5O82YiC2NknzSA5H",
  pack300: process.env.STRIPE_PRICE_PACK_300 || "price_1TbysNDs5O82YiC24ankJlzm",
  pack750: process.env.STRIPE_PRICE_PACK_750 || "price_1TbysODs5O82YiC2mRXGWLOH",
  pack2000: process.env.STRIPE_PRICE_PACK_2000 || "price_1TbysODs5O82YiC2nbO4luyS",
} as const;

export const stripeProductIds = {
  starter: "prod_UbBEk3ZB8WXwei",
  growth: "prod_UbBEX9KipbdkWN",
  scale: "prod_UbBETtcdpUHk4n",
  pack100: "prod_UbBEjJn0fFVb1f",
  pack300: "prod_UbBEKGyNyE3kjv",
  pack750: "prod_UbBEeXotlGN93h",
  pack2000: "prod_UbBEn1XveQhld8",
} as const;

/**
 * Stripe Payment Links — hosted `buy.stripe.com/...` URLs we can drop in
 * directly from the marketing `/pricing` page. No server session
 * creation, no auth required. After payment, Stripe redirects to
 * `/app/settings?checkout=success&plan=…` (or `&pack=…`) and the webhook
 * matches the resulting customer to a Rufus workspace by email.
 *
 * Override per-environment via env vars when you want test-mode links.
 */
export const stripePaymentLinks = {
  starter: process.env.STRIPE_LINK_STARTER || "https://buy.stripe.com/cNi5kDeYP5XS5qr1dqcEw0a",
  growth: process.env.STRIPE_LINK_GROWTH || "https://buy.stripe.com/aFa00j7wndqk9GH7BOcEw0b",
  scale: process.env.STRIPE_LINK_SCALE || "https://buy.stripe.com/9B67sL4kb1HCaKL5tGcEw0c",
  pack100: process.env.STRIPE_LINK_PACK_100 || "https://buy.stripe.com/bJe6oH2c34TO4mn9JWcEw0d",
  pack300: process.env.STRIPE_LINK_PACK_300 || "https://buy.stripe.com/dRmeVdbMDgCwbOP7BOcEw0e",
  pack750: process.env.STRIPE_LINK_PACK_750 || "https://buy.stripe.com/5kQ4gzaIz71WaKLcW8cEw0f",
  pack2000: process.env.STRIPE_LINK_PACK_2000 || "https://buy.stripe.com/00w28rdUL4TOaKL4pCcEw0g",
} as const;

/**
 * The canonical set of Rufus price IDs — the single source of truth the
 * webhook checks against to decide whether an event belongs to us.
 *
 * Sibling ExpoSQL apps live in the same Stripe account; this guard ensures
 * a stray event from another product can never grant Rufus credits or
 * flip a Rufus workspace's plan, even if it accidentally carries
 * matching metadata.
 */
const RUFUS_PRICE_SET = new Set<string>(Object.values(stripePrices));

export function isRufusPriceId(id?: string | null): boolean {
  if (!id) return false;
  return RUFUS_PRICE_SET.has(id);
}

/** Returns true if any of the supplied price IDs is a Rufus price. */
export function anyRufusPriceId(ids: Array<string | null | undefined>): boolean {
  return ids.some((id) => isRufusPriceId(id));
}

export type PackKey = "pack100" | "pack300" | "pack750" | "pack2000";

export const packCredits: Record<PackKey, number> = {
  pack100: 100,
  pack300: 300,
  pack750: 750,
  pack2000: 2000,
};

export type SubscriptionKey = "starter" | "growth" | "scale";

export const subscriptionMonthlyCredits: Record<SubscriptionKey, number> = {
  starter: 400,
  growth: 1200,
  scale: 3500,
};
