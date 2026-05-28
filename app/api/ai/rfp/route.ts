import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { knowledgeEntries, rfpResponses } from "@/lib/db/schema";
import { ensureUserAndWorkspace, spendCredits, grantCredits, listKnowledge } from "@/lib/db/queries";
import { ANTHROPIC_CONFIGURED } from "@/lib/ai/anthropic";
import { answerRfp } from "@/lib/ai/rfp";
import { rfpQuestionCost } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  if (!ANTHROPIC_CONFIGURED) return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });

  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const text = typeof body?.text === "string" ? body.text : "";
  const questions = text
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean);
  if (!questions.length) {
    return NextResponse.json({ error: "no_questions" }, { status: 400 });
  }

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const knowledge = await listKnowledge(workspace.id);
  if (!knowledge.length) {
    return NextResponse.json({ error: "empty_knowledge_base" }, { status: 422 });
  }

  const cost = questions.reduce((s: number, q: string) => s + rfpQuestionCost(q), 0);

  // Pre-deduct so concurrent calls can't double-spend
  const spendRes = await spendCredits(
    workspace.id,
    cost,
    `RFP: ${questions.length} question${questions.length === 1 ? "" : "s"} answered`,
    "ai",
  );
  if (!spendRes.ok) {
    return NextResponse.json({ error: "insufficient_credits", remaining: spendRes.remaining }, { status: 402 });
  }

  let answers;
  try {
    answers = await answerRfp({
      workspace: {
        companyName: workspace.companyName,
        industry: workspace.industry,
        defaultTone: workspace.defaultTone,
        services: workspace.services,
        clientType: workspace.clientType,
      },
      knowledge,
      questions,
    });
  } catch (err) {
    // Refund credits — the AI call failed before we delivered value
    await grantCredits(workspace.id, cost, "Refund: RFP generation failed", "refund");
    return NextResponse.json({ error: "ai_failed", detail: String(err).slice(0, 200) }, { status: 502 });
  }

  const [saved] = await db
    .insert(rfpResponses)
    .values({
      workspaceId: workspace.id,
      title: `RFP — ${questions.length} question${questions.length === 1 ? "" : "s"}`,
      sourceText: text,
      answers,
      status: "draft",
    })
    .returning();

  return NextResponse.json({ id: saved.id, answers, remaining: spendRes.remaining - 0 });
}
