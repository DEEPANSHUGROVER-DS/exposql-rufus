import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { proposals, rfpResponses, contractReviews, workspaces } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Admin-only: list a workspace's proposals + RFPs + contracts. Used by
 * the admin workspace deep-dive page's three new tabs. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
  if (!ws) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const limit = 50;
  const [props, rfps, contracts] = await Promise.all([
    db
      .select({
        id: proposals.id,
        clientName: proposals.clientName,
        title: proposals.title,
        status: proposals.status,
        hostedSlug: proposals.hostedSlug,
        viewedAt: proposals.viewedAt,
        updatedAt: proposals.updatedAt,
      })
      .from(proposals)
      .where(eq(proposals.workspaceId, id))
      .orderBy(desc(proposals.updatedAt))
      .limit(limit),
    db
      .select({
        id: rfpResponses.id,
        title: rfpResponses.title,
        status: rfpResponses.status,
        updatedAt: rfpResponses.updatedAt,
      })
      .from(rfpResponses)
      .where(eq(rfpResponses.workspaceId, id))
      .orderBy(desc(rfpResponses.updatedAt))
      .limit(limit),
    db
      .select({
        id: contractReviews.id,
        title: contractReviews.title,
        fileName: contractReviews.fileName,
        createdAt: contractReviews.createdAt,
      })
      .from(contractReviews)
      .where(eq(contractReviews.workspaceId, id))
      .orderBy(desc(contractReviews.createdAt))
      .limit(limit),
  ]);

  return NextResponse.json({ proposals: props, rfps, contracts });
}
