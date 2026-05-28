import { NextResponse } from "next/server";
import { count, desc, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { users, workspaces, creditPurchases, creditLedger, knowledgeEntries, proposals, rfpResponses, contractReviews } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const [
    [{ c: usersCount }],
    [{ c: workspacesCount }],
    planRows,
    [creditTotals],
    [{ c: purchasesCount }],
    [revenueRow],
    recentPurchases,
    recentUsers,
    [{ c: knowledgeCount }],
    [{ c: proposalsCount }],
    [{ c: rfpsCount }],
    [{ c: contractsCount }],
  ] = await Promise.all([
    db.select({ c: count() }).from(users),
    db.select({ c: count() }).from(workspaces),
    db.select({ plan: workspaces.plan, c: count() }).from(workspaces).groupBy(workspaces.plan),
    db
      .select({
        used: sql<number>`COALESCE(SUM(${workspaces.creditsUsed}), 0)`,
        bought: sql<number>`COALESCE(SUM(${workspaces.creditsBought}), 0)`,
        included: sql<number>`COALESCE(SUM(${workspaces.creditsIncluded}), 0)`,
      })
      .from(workspaces),
    db.select({ c: count() }).from(creditPurchases).where(eq(creditPurchases.status, "completed")),
    db
      .select({ total: sql<number>`COALESCE(SUM(${creditPurchases.amount}), 0)` })
      .from(creditPurchases)
      .where(eq(creditPurchases.status, "completed")),
    db
      .select()
      .from(creditPurchases)
      .where(eq(creditPurchases.status, "completed"))
      .orderBy(desc(creditPurchases.createdAt))
      .limit(10),
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
        plan: workspaces.plan,
        workspaceId: workspaces.id,
      })
      .from(users)
      .leftJoin(workspaces, eq(workspaces.ownerId, users.id))
      .orderBy(desc(users.createdAt))
      .limit(10),
    db.select({ c: count() }).from(knowledgeEntries),
    db.select({ c: count() }).from(proposals),
    db.select({ c: count() }).from(rfpResponses),
    db.select({ c: count() }).from(contractReviews),
  ]);

  // Recent ledger (cross-workspace) — useful for spotting abuse
  const recentLedger = await db
    .select()
    .from(creditLedger)
    .orderBy(desc(creditLedger.createdAt))
    .limit(15);

  return NextResponse.json({
    counts: {
      users: usersCount,
      workspaces: workspacesCount,
      knowledge: knowledgeCount,
      proposals: proposalsCount,
      rfps: rfpsCount,
      contracts: contractsCount,
      purchasesCompleted: purchasesCount,
    },
    plans: planRows,
    credits: creditTotals,
    revenueCents: revenueRow.total,
    recentPurchases,
    recentUsers,
    recentLedger,
  });
}
