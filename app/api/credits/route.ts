import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DB_CONFIGURED } from "@/lib/db";
import { ensureUserAndWorkspace, spendCredits, listLedger, creditsRemaining } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });
  const ledger = await listLedger(workspace.id);
  return NextResponse.json({ remaining: creditsRemaining(workspace), ledger });
}

/** Spend credits. Body: { amount: number, reason: string, refId?: string }. */
export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount);
  const reason = String(body.reason ?? "").slice(0, 200);
  const refId = body.refId ? String(body.refId).slice(0, 80) : undefined;
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }
  if (!reason) return NextResponse.json({ error: "reason_required" }, { status: 400 });

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });
  const res = await spendCredits(workspace.id, Math.floor(amount), reason, "ai", refId);
  if (!res.ok) {
    return NextResponse.json({ error: "insufficient_credits", remaining: res.remaining }, { status: 402 });
  }
  return NextResponse.json({ ok: true, remaining: res.remaining });
}
