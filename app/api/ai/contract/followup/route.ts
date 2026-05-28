import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DB_CONFIGURED } from "@/lib/db";
import { ensureUserAndWorkspace, spendCredits, grantCredits } from "@/lib/db/queries";
import { ANTHROPIC_CONFIGURED } from "@/lib/ai/anthropic";
import { askContractFollowup } from "@/lib/ai/contract";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARS = 60000;

function cost(question: string): number {
  const len = question.trim().length;
  if (len > 160) return 5;
  if (len > 70) return 4;
  return 3;
}

export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  if (!ANTHROPIC_CONFIGURED) return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });

  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const text = String(body?.text ?? "");
  const question = String(body?.question ?? "").trim();
  if (!question) return NextResponse.json({ error: "empty_question" }, { status: 400 });
  if (!text.trim()) return NextResponse.json({ error: "empty_contract" }, { status: 400 });
  if (text.length > MAX_CHARS) return NextResponse.json({ error: "too_long" }, { status: 413 });

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const c = cost(question);
  const spendRes = await spendCredits(workspace.id, c, `Contract follow-up: ${question.slice(0, 60)}`, "ai");
  if (!spendRes.ok) {
    return NextResponse.json({ error: "insufficient_credits", remaining: spendRes.remaining }, { status: 402 });
  }

  let answer;
  try {
    answer = await askContractFollowup({ contractText: text, question });
  } catch (err) {
    await grantCredits(workspace.id, c, "Refund: contract follow-up failed", "refund");
    return NextResponse.json({ error: "ai_failed", detail: String(err).slice(0, 200) }, { status: 502 });
  }

  return NextResponse.json({ answer, credits: c, remaining: spendRes.remaining });
}
