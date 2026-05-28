import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { users, workspaces } from "@/lib/db/schema";
import { grantCredits } from "@/lib/db/queries";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Admin-only. Grants credits to a workspace identified by the owner's email.
 * Body: { email: string, credits: number, reason: string }. */
export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const credits = Math.floor(Number(body.credits));
  const reason = String(body.reason ?? "").trim().slice(0, 200) || "Admin grant";

  if (!email || !Number.isFinite(credits) || credits <= 0) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  const [ws] = await db.select().from(workspaces).where(eq(workspaces.ownerId, user.id)).limit(1);
  if (!ws) return NextResponse.json({ error: "workspace_not_found" }, { status: 404 });

  await grantCredits(ws.id, credits, `Admin grant by ${session.user.email}: ${reason}`, "grant");
  return NextResponse.json({ ok: true, workspaceId: ws.id });
}
