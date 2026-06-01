import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { ensureUserAndWorkspace } from "@/lib/db/queries";
import {
  packCredits,
  stripe,
  stripePrices,
  STRIPE_CONFIGURED,
  type PackKey,
  type SubscriptionKey,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public checkout launcher.
 *
 * Marketing pricing buttons link here with `?kind=subscription&key=starter`
 * or `?kind=pack&key=pack100`. We handle both auth states inline:
 *
 * 1. Not signed in → redirect to /signin with a callbackUrl back to here.
 *    After sign-in, the user lands back on this page authenticated, and we
 *    continue straight to Stripe.
 *
 * 2. Signed in + DB + Stripe configured → ensure workspace, create or reuse
 *    the workspace's Stripe customer, create a Checkout Session, and
 *    redirect the browser to Stripe.
 *
 * 3. Anything misconfigured → fall back to /pricing with an error param.
 *
 * Pay-as-you-go (free signup) doesn't go through here — its button on
 * /pricing links to /app directly. Workspaces start with zero credits;
 * the user buys a pack or subscribes when they want to generate.
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; key?: string }>;
}) {
  const sp = await searchParams;
  const kind = sp.kind === "subscription" || sp.kind === "pack" ? sp.kind : null;
  const key = typeof sp.key === "string" ? sp.key : null;

  if (!kind || !key || !(key in stripePrices)) {
    redirect("/pricing?error=invalid_request");
  }

  // Authenticate
  const session = await auth();
  if (!session?.user?.email) {
    const callback = `/checkout?kind=${kind}&key=${encodeURIComponent(key)}`;
    redirect(`/signin?callbackUrl=${encodeURIComponent(callback)}`);
  }

  if (!DB_CONFIGURED || !STRIPE_CONFIGURED) {
    redirect("/pricing?error=service_unavailable");
  }

  // Ensure user + workspace exist (idempotent)
  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  // Ensure Stripe customer
  let customerId = workspace.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name ?? undefined,
      metadata: { workspaceId: workspace.id, ownerEmail: session.user.email },
    });
    customerId = customer.id;
    await db.update(workspaces).set({ stripeCustomerId: customerId }).where(eq(workspaces.id, workspace.id));
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rufus.exposql.com";

  let checkoutUrl: string | null = null;

  if (kind === "subscription") {
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: stripePrices[key as SubscriptionKey], quantity: 1 }],
      success_url: `${siteUrl}/app/settings?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
      metadata: { workspaceId: workspace.id, planKey: key },
    });
    checkoutUrl = checkout.url;
  } else {
    const packKey = key as PackKey;
    const credits = packCredits[packKey];
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: stripePrices[packKey], quantity: 1 }],
      success_url: `${siteUrl}/app/settings?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
      metadata: { workspaceId: workspace.id, packKey, credits: String(credits) },
    });
    checkoutUrl = checkout.url;
  }

  if (!checkoutUrl) redirect("/pricing?error=stripe_failed");
  redirect(checkoutUrl);
}
