import { NextResponse } from "next/server";
import { eq, isNull, and } from "drizzle-orm";
import { db, DB_CONFIGURED } from "@/lib/db";
import { proposals, workspaces, users } from "@/lib/db/schema";
import { sendProposalViewedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Records the first-open timestamp on a hosted proposal. No auth — anyone
 * with the slug can hit this (that's the point). We only set viewed_at on
 * the first hit; subsequent calls are a no-op so reloads don't reset.
 * On first view we also fire a "your proposal was opened" email to the
 * workspace owner (no-op when RESEND_API_KEY missing). */
export async function POST(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ ok: false }, { status: 503 });
  const { slug } = await ctx.params;
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  // Find the proposal so we can email the owner on the first open.
  const [proposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.hostedSlug, slug))
    .limit(1);
  if (!proposal) return NextResponse.json({ ok: true });
  const alreadyViewed = Boolean(proposal.viewedAt);

  await db
    .update(proposals)
    .set({ viewedAt: new Date() })
    .where(and(eq(proposals.hostedSlug, slug), isNull(proposals.viewedAt)));

  if (!alreadyViewed) {
    // Resolve the owner's email and notify (best-effort)
    void (async () => {
      try {
        const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, proposal.workspaceId)).limit(1);
        if (!ws) return;
        const [owner] = await db.select().from(users).where(eq(users.id, ws.ownerId)).limit(1);
        if (!owner?.email) return;
        await sendProposalViewedEmail(owner.email, {
          clientName: proposal.clientName,
          title: proposal.title,
          slug,
        });
      } catch {
        /* tolerate */
      }
    })();
  }

  return NextResponse.json({ ok: true });
}
