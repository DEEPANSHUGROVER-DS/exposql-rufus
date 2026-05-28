import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { workspaces, creditPurchases } from "@/lib/db/schema";
import { ensureUserAndWorkspace } from "@/lib/db/queries";
import { stripe, stripePrices, packCredits, STRIPE_CONFIGURED, type PackKey, type SubscriptionKey } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Body: { kind: "subscription" | "pack", key: "starter"|"growth"|"scale"|"pack100"|... } */
export async function POST(req: Request) {
  if (!DB_CONFIGURED || !STRIPE_CONFIGURED) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const kind = body?.kind as "subscription" | "pack";
  const key = body?.key as SubscriptionKey | PackKey;
  if (!kind || !key || !(key in stripePrices)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  // Make sure we have a Stripe customer for this workspace
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

  if (kind === "subscription") {
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: stripePrices[key as SubscriptionKey], quantity: 1 }],
      success_url: `${siteUrl}/app/settings?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
      metadata: { workspaceId: workspace.id, planKey: key },
    });
    return NextResponse.json({ url: checkout.url });
  }

  const packKey = key as PackKey;
  const credits = packCredits[packKey];
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: stripePrices[packKey], quantity: 1 }],
    success_url: `${siteUrl}/app/settings?checkout=success`,
    cancel_url: `${siteUrl}/app/settings?checkout=cancelled`,
    metadata: { workspaceId: workspace.id, packKey, credits: String(credits) },
  });

  // Record pending purchase for webhook reconciliation
  if (checkout.id) {
    await db.insert(creditPurchases).values({
      workspaceId: workspace.id,
      stripeSessionId: checkout.id,
      packKey,
      credits,
      amount: checkout.amount_total ?? 0,
      status: "pending",
    });
  }

  return NextResponse.json({ url: checkout.url });
}
