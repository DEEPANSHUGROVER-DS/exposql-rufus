import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { db, DB_CONFIGURED } from "@/lib/db";
import { creditPurchases, workspaces } from "@/lib/db/schema";
import { ensureUserAndWorkspace, grantCredits } from "@/lib/db/queries";
import {
  anyRufusPriceId,
  isRufusPriceId,
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

function priceIdToPackKey(priceId: string): PackKey | null {
  if (priceId === stripePrices.pack100) return "pack100";
  if (priceId === stripePrices.pack300) return "pack300";
  if (priceId === stripePrices.pack750) return "pack750";
  if (priceId === stripePrices.pack2000) return "pack2000";
  return null;
}

/**
 * Pulls line-item price IDs for a Checkout Session. The session in the
 * webhook payload doesn't include line items by default — we have to ask
 * Stripe for them. Used as the authoritative "is this our product?" test.
 */
async function getSessionPriceIds(sessionId: string): Promise<string[]> {
  try {
    const items = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });
    return items.data
      .map((li) => (typeof li.price === "object" && li.price ? li.price.id : null))
      .filter((id): id is string => !!id);
  } catch {
    return [];
  }
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

      // Belt + braces: only act on sessions whose line items include a
      // Rufus price. Metadata can be set by any app sharing the Stripe
      // account; the price IDs are ours alone.
      const priceIds = await getSessionPriceIds(s.id);
      if (!anyRufusPriceId(priceIds)) break;

      // Find which Rufus product was purchased — from the actual line
      // item, not from metadata. We trust price IDs because we control
      // them; we treat metadata as a hint only.
      let planKey: SubscriptionKey | undefined;
      let packKey: PackKey | undefined;
      for (const id of priceIds) {
        const p = priceIdToPlanKey(id);
        if (p) {
          planKey = p;
          break;
        }
        const k = priceIdToPackKey(id);
        if (k) {
          packKey = k;
          break;
        }
      }

      // Two flows produce this event:
      //   1. Authenticated /api/stripe/checkout — metadata.workspaceId is set
      //   2. Anonymous Payment Link from /pricing — workspace is resolved
      //      from the customer's email after Stripe collects it
      let workspaceId = s.metadata?.workspaceId;

      if (!workspaceId) {
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
      }

      if (!workspaceId) break;

      if (s.mode === "payment" && packKey) {
        const finalCredits = packCredits[packKey];
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
            packKey,
            credits: finalCredits,
            amount: s.amount_total ?? 0,
            status: "completed",
          });
        }
        await grantCredits(
          workspaceId,
          finalCredits,
          `Pack purchase: ${packKey} (${finalCredits} credits)`,
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

      // Price-ID guard: invoice must reference a Rufus price.
      const lineItems = inv.lines?.data ?? [];
      const linePriceIds = lineItems
        .map((li) => (li.pricing?.price_details?.price as string | undefined) ?? null)
        .filter((x): x is string => !!x);
      if (!anyRufusPriceId(linePriceIds)) break;

      const [ws] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.stripeSubscriptionId, String(subId)))
        .limit(1);
      if (!ws) break;

      const rufusPriceId = linePriceIds.find(isRufusPriceId);
      const planKey = rufusPriceId ? priceIdToPlanKey(rufusPriceId) : null;
      if (planKey) {
        const monthly = subscriptionMonthlyCredits[planKey];
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

      // Price-ID guard: subscription must reference a Rufus price.
      const subItemPriceIds = sub.items?.data?.map((it) => it.price?.id ?? null) ?? [];
      if (!anyRufusPriceId(subItemPriceIds)) break;

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
