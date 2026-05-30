import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { contractReviews } from "@/lib/db/schema";
import { ensureUserAndWorkspace, spendCredits, grantCredits } from "@/lib/db/queries";
import { ANTHROPIC_CONFIGURED } from "@/lib/ai/anthropic";
import { rerunContractSection, type ContractSection } from "@/lib/ai/contract";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const COST: Record<ContractSection, number> = { summary: 5, flags: 8, edits: 7 };

export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  if (!ANTHROPIC_CONFIGURED) return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const reviewId = String(body?.reviewId ?? "");
  const section = body?.section as ContractSection;
  const instruction = typeof body?.instruction === "string" ? body.instruction : undefined;

  if (!reviewId || (section !== "summary" && section !== "flags" && section !== "edits")) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const [row] = await db
    .select()
    .from(contractReviews)
    .where(and(eq(contractReviews.id, reviewId), eq(contractReviews.workspaceId, workspace.id)))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!row.sourceText) return NextResponse.json({ error: "no_source_text" }, { status: 400 });

  const c = COST[section];
  const spendRes = await spendCredits(workspace.id, c, `Contract re-run: ${section}`, "ai");
  if (!spendRes.ok) {
    return NextResponse.json({ error: "insufficient_credits", remaining: spendRes.remaining }, { status: 402 });
  }

  let updated;
  try {
    updated = await rerunContractSection({ contractText: row.sourceText, section, instruction });
  } catch (err) {
    await grantCredits(workspace.id, c, `Refund: contract re-run (${section}) failed`, "refund");
    return NextResponse.json({ error: "ai_failed", detail: String(err).slice(0, 200) }, { status: 502 });
  }

  const patch: Partial<typeof contractReviews.$inferInsert> = {};
  if (section === "summary" && updated.summary) patch.summary = updated.summary;
  if (section === "flags" && updated.redFlags) patch.redFlags = updated.redFlags;
  if (section === "edits" && updated.suggestedEdits) patch.suggestedEdits = updated.suggestedEdits;
  await db.update(contractReviews).set(patch).where(eq(contractReviews.id, reviewId));

  return NextResponse.json({ ...updated, credits: c, remaining: spendRes.remaining });
}
