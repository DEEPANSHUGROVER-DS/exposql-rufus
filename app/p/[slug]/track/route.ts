import { NextResponse } from "next/server";
import { eq, isNull, and } from "drizzle-orm";
import { db, DB_CONFIGURED } from "@/lib/db";
import { proposals } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Records the first-open timestamp on a hosted proposal. No auth — anyone
 * with the slug can hit this (that's the point). We only set viewed_at on
 * the first hit; subsequent calls are a no-op so reloads don't reset. */
export async function POST(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ ok: false }, { status: 503 });
  const { slug } = await ctx.params;
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  await db
    .update(proposals)
    .set({ viewedAt: new Date() })
    .where(and(eq(proposals.hostedSlug, slug), isNull(proposals.viewedAt)));

  return NextResponse.json({ ok: true });
}
