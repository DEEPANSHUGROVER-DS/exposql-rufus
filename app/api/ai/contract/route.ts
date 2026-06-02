import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { contractReviews } from "@/lib/db/schema";
import { ensureUserAndWorkspace, spendCredits, grantCredits } from "@/lib/db/queries";
import { ANTHROPIC_CONFIGURED } from "@/lib/ai/anthropic";
import { reviewContract } from "@/lib/ai/contract";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 90;

const MAX_CHARS = 150000;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  if (!ANTHROPIC_CONFIGURED) return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });

  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const text = String(body?.text ?? "");
  const fileName = String(body?.fileName ?? "");
  if (!text.trim()) return NextResponse.json({ error: "empty_text" }, { status: 400 });
  if (text.length > MAX_CHARS) return NextResponse.json({ error: "too_long", maxChars: MAX_CHARS }, { status: 413 });

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  // Cost scales with input length, clamped 10-30.
  const cost = clamp(10 + Math.floor(text.length / 2500), 10, 30);

  const spendRes = await spendCredits(
    workspace.id,
    cost,
    `Contract review${fileName ? ": " + fileName : ""}`,
    "ai",
  );
  if (!spendRes.ok) {
    return NextResponse.json({ error: "insufficient_credits", remaining: spendRes.remaining }, { status: 402 });
  }

  let review;
  try {
    review = await reviewContract({ contractText: text, fileName });
  } catch (err) {
    await grantCredits(workspace.id, cost, "Refund: contract review failed", "refund");
    return NextResponse.json({ error: "ai_failed", detail: String(err).slice(0, 200) }, { status: 502 });
  }

  const [saved] = await db
    .insert(contractReviews)
    .values({
      workspaceId: workspace.id,
      title: fileName || "Contract review",
      fileName,
      sourceText: text,
      summary: review.summary,
      redFlags: review.redFlags,
      suggestedEdits: review.suggestedEdits,
    })
    .returning();

  return NextResponse.json({ id: saved.id, ...review, remaining: spendRes.remaining });
}
