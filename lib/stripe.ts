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
