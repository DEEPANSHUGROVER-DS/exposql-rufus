import { NextResponse } from "next/server";
import { count, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import {
  users,
  workspaces,
  knowledgeEntries,
  proposals,
  rfpResponses,
  contractReviews,
  creditLedger,
  creditPurchases,
} from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
  if (!workspace) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [
    [owner],
    [{ c: kbCount }],
    [{ c: propCount }],
    [{ c: rfpCount }],
    [{ c: contractCount }],
    ledger,
    purchases,
  ] = await Promise.all([
    db.select().from(users).where(eq(users.id, workspace.ownerId)).limit(1),
    db.select({ c: count() }).from(knowledgeEntries).where(eq(knowledgeEntries.workspaceId, id)),
    db.select({ c: count() }).from(proposals).where(eq(proposals.workspaceId, id)),
    db.select({ c: count() }).from(rfpResponses).where(eq(rfpResponses.workspaceId, id)),
    db.select({ c: count() }).from(contractReviews).where(eq(contractReviews.workspaceId, id)),
    db.select().from(creditLedger).where(eq(creditLedger.workspaceId, id)).orderBy(desc(creditLedger.createdAt)).limit(20),
    db.select().from(creditPurchases).where(eq(creditPurchases.workspaceId, id)).orderBy(desc(creditPurchases.createdAt)).limit(10),
  ]);

  return NextResponse.json({
    workspace,
    owner: owner ?? null,
    counts: {
      knowledge: kbCount,
      proposals: propCount,
      rfps: rfpCount,
      contracts: contractCount,
    },
    ledger,
    purchases,
  });
}
