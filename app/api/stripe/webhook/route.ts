import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { db, DB_CONFIGURED } from "@/lib/db";
import { creditPurchases, workspaces } from "@/lib/db/schema";
import { ensureUserAndWorkspace, grantCredits } from "@/lib/db/queries";
import {
  packCredits,
  stripe,
  stripePrices,
  subscriptionMonthlyCredits,
  STRIPE_CONFIGURED,
  type PackKey,
  type SubscriptionKey,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function priceIdToPlanKey(priceId: string): SubscriptionKey | null {
  if (priceId === stripePrices.starter) return "starter";
  if (priceId === stripePrices.growth) return "growth";
  if (priceId === stripePrices.scale) return "scale";
  return null;
}

export async function POST(req: Request) {
  if (!DB_CONFIGURED || !STRIPE_CONFIGURED) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "webhook_secret_missing" }, { status: 500 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: "invalid_signature", detail: String(err) }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;

      // Two flows produce this event:
      //   1. Authenticated /api/stripe/checkout — metadata.workspaceId is set
      //   2. Anonymous Payment Link from /pricing — metadata.product === "rufus",
      //      metadata.kind, metadata.key set; workspace must be resolved by
      //      the customer's email after Stripe collects it.
      let workspaceId = s.metadata?.workspaceId;
      let planKey = s.metadata?.planKey as SubscriptionKey | undefined;
      let packKey = (s.metadata?.packKey || s.metadata?.key) as PackKey | undefined;
      let credits = Number(s.metadata?.credits || 0);

      if (!workspaceId && s.metadata?.product === "rufus") {
        const email = s.customer_details?.email || s.customer_email || null;
        if (!email) break;
        const { workspace } = await ensureUserAndWorkspace({ email, name: s.customer_details?.name ?? null });
        workspaceId = workspace.id;

        // Attach the Stripe customer to the workspace
        const stripeCustomerId =
          typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;
        if (stripeCustomerId && !workspace.stripeCustomerId) {
          await db
            .update(workspaces)
            .set({ stripeCustomerId })
            .where(eq(workspaces.id, workspace.id));
        }

        // Read kind/key from metadata if not already populated
        const kind = s.metadata?.kind;
        const key = s.metadata?.key;
        if (kind === "subscription" && key) planKey = key as SubscriptionKey;
        if (kind === "pack" && key) {
          packKey = key as PackKey;
          if (!credits && packKey in packCredits) credits = packCredits[packKey];
        }
      }

      if (!workspaceId) break;

      if (s.mode === "payment" && (credits > 0 || (packKey && packKey in packCredits))) {
        const finalCredits = credits || packCredits[packKey as PackKey];
        // Upsert the credit_purchase row (Payment Link flow won't have a
        // prior pending row).
        const existing = await db
          .select()
          .from(creditPurchases)
          .where(eq(creditPurchases.stripeSessionId, s.id))
          .limit(1);
        if (existing[0]) {
          await db
            .update(creditPurchases)
            .set({ status: "completed", amount: s.amount_total ?? 0 })
            .where(eq(creditPurchases.stripeSessionId, s.id));
        } else {
          await db.insert(creditPurchases).values({
            workspaceId,
            stripeSessionId: s.id,
            packKey: packKey || "unknown",
            credits: finalCredits,
            amount: s.amount_total ?? 0,
            status: "completed",
          });
        }
        await grantCredits(
          workspaceId,
          finalCredits,
          `Pack purchase: ${packKey ?? "credits"} (${finalCredits} credits)`,
          "purchase",
          s.id,
        );
      } else if (s.mode === "subscription" && planKey) {
        const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
        const monthly = subscriptionMonthlyCredits[planKey];
        await db
          .update(workspaces)
          .set({
            plan: planKey,
            stripeSubscriptionId: subId ?? null,
            subscriptionStatus: "active",
            creditsIncluded: monthly,
            creditsUsed: 0,
          })
          .where(eq(workspaces.id, workspaceId));
        await grantCredits(workspaceId, monthly, `${planKey} plan — monthly credits`, "grant", subId);
      }
      break;
    }
    case "invoice.payment_succeeded": {
      // Monthly renewal — refresh credits to the plan's monthly allowance.
      const inv = event.data.object as Stripe.Invoice;
      const subId = (inv as unknown as { subscription?: string }).subscription;
      if (!subId) break;
      const [ws] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.stripeSubscriptionId, String(subId)))
        .limit(1);
      if (!ws) break;
      const lineItems = inv.lines?.data ?? [];
      const priceId = lineItems[0]?.pricing?.price_details?.price as string | undefined;
      const planKey = priceId ? priceIdToPlanKey(priceId) : (ws.plan as SubscriptionKey | "free");
      if (planKey && planKey !== "free") {
        const monthly = subscriptionMonthlyCredits[planKey as SubscriptionKey];
        await db
          .update(workspaces)
          .set({
            creditsIncluded: monthly,
            creditsUsed: 0,
            subscriptionStatus: "active",
          })
          .where(eq(workspaces.id, ws.id));
        await grantCredits(ws.id, monthly, `${planKey} plan — monthly renewal`, "grant", String(subId));
      }
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const [ws] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.stripeSubscriptionId, sub.id))
        .limit(1);
      if (!ws) break;
      const status = sub.status;
      await db
        .update(workspaces)
        .set({
          subscriptionStatus: status,
          plan: status === "active" ? ws.plan : "free",
        })
        .where(eq(workspaces.id, ws.id));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
