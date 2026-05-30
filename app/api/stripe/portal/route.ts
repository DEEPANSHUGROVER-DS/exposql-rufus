import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DB_CONFIGURED } from "@/lib/db";
import { ensureUserAndWorkspace } from "@/lib/db/queries";
import { stripe, STRIPE_CONFIGURED } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Creates a Stripe Billing Portal session and returns the URL. The portal
 * is where customers cancel subscriptions, update cards, download invoices,
 * and see billing history — everything Stripe handles for us.
 *
 * Prereq: configure the portal once in Stripe Dashboard →
 *   Settings → Billing → Customer portal (live mode).
 */
export async function POST() {
  if (!DB_CONFIGURED || !STRIPE_CONFIGURED) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  if (!workspace.stripeCustomerId) {
    return NextResponse.json({ error: "no_stripe_customer", message: "Buy a plan or credit pack first — that creates your Stripe customer." }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rufus.exposql.com";

  const portal = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: `${siteUrl}/app/settings`,
  });

  return NextResponse.json({ url: portal.url });
}
