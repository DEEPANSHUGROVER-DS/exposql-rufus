import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { creditLedger, creditPurchases, users, workspaces } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CsvKind = "users" | "purchases" | "ledger";

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvFromRows(headers: string[], rows: Record<string, unknown>[]): string {
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((h) => csvCell(row[h])).join(","));
  return lines.join("\n");
}

export async function GET(req: Request) {
  if (!DB_CONFIGURED) return new Response("database_not_configured", { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return new Response("unauthenticated", { status: 401 });
  if (!isAdmin(session.user.email)) return new Response("forbidden", { status: 403 });

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") as CsvKind;
  if (kind !== "users" && kind !== "purchases" && kind !== "ledger") {
    return new Response("invalid_kind — use users | purchases | ledger", { status: 400 });
  }

  let csv = "";
  let filename = "";

  if (kind === "users") {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
        plan: workspaces.plan,
        workspaceId: workspaces.id,
        creditsIncluded: workspaces.creditsIncluded,
        creditsBought: workspaces.creditsBought,
        creditsUsed: workspaces.creditsUsed,
      })
      .from(users)
      .leftJoin(workspaces, eq(workspaces.ownerId, users.id))
      .orderBy(desc(users.createdAt));
    csv = csvFromRows(
      ["id", "email", "name", "createdAt", "plan", "workspaceId", "creditsIncluded", "creditsBought", "creditsUsed"],
      rows.map((r) => ({ ...r, createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt) })),
    );
    filename = "rufus-users";
  } else if (kind === "purchases") {
    const rows = await db
      .select()
      .from(creditPurchases)
      .orderBy(desc(creditPurchases.createdAt));
    csv = csvFromRows(
      ["id", "workspaceId", "stripeSessionId", "packKey", "credits", "amount", "status", "createdAt"],
      rows.map((r) => ({ ...r, createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt) })),
    );
    filename = "rufus-purchases";
  } else {
    const rows = await db.select().from(creditLedger).orderBy(desc(creditLedger.createdAt)).limit(5000);
    csv = csvFromRows(
      ["id", "workspaceId", "delta", "reason", "source", "refId", "createdAt"],
      rows.map((r) => ({ ...r, createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt) })),
    );
    filename = "rufus-ledger";
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
