import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DB_CONFIGURED } from "@/lib/db";
import { ensureUserAndWorkspace, spendCredits, grantCredits } from "@/lib/db/queries";
import { ANTHROPIC_CONFIGURED, anthropic, MODEL, extractText } from "@/lib/ai/anthropic";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

type EditAction = "rewrite" | "shorten" | "lengthen" | "formal" | "friendly" | "concise";

const PROMPTS: Record<EditAction, string> = {
  rewrite:
    "Rewrite the following passage to be clearer and tighter without losing any specifics, numbers, or names. Match the original tone.",
  shorten:
    "Shorten the following passage by at least 25%. Preserve every concrete fact (numbers, names, dates). No filler.",
  lengthen:
    "Expand the following passage with one or two extra sentences of useful detail, drawing only on what the passage already implies. Don't invent new facts.",
  formal:
    "Rewrite the following passage in a formal, business-professional tone. Preserve every fact.",
  friendly:
    "Rewrite the following passage in a friendly, conversational tone. Preserve every fact and stay professional.",
  concise:
    "Rewrite the following passage to be as concise as possible without losing any specifics. Aim for a punchy, direct cadence.",
};

const VALID = new Set<EditAction>(["rewrite", "shorten", "lengthen", "formal", "friendly", "concise"]);

export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  if (!ANTHROPIC_CONFIGURED) return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const text = String(body?.text ?? "").trim();
  const action = body?.action as EditAction;
  if (!text) return NextResponse.json({ error: "empty_text" }, { status: 400 });
  if (!VALID.has(action)) return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  if (text.length > 8000) return NextResponse.json({ error: "too_long", maxChars: 8000 }, { status: 413 });

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const cost = 1;
  const spendRes = await spendCredits(workspace.id, cost, `Inline edit: ${action}`, "ai");
  if (!spendRes.ok) return NextResponse.json({ error: "insufficient_credits", remaining: spendRes.remaining }, { status: 402 });

  let result: string;
  try {
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: `${PROMPTS[action]} Return ONLY the rewritten passage as plain text — no commentary, no markdown fences, no quotation marks wrapping the answer.`,
        },
      ],
      messages: [{ role: "user", content: text }],
    });
    result = extractText(resp).trim();
    if (!result) throw new Error("Empty response");
  } catch (err) {
    await grantCredits(workspace.id, cost, `Refund: inline edit (${action}) failed`, "refund");
    return NextResponse.json({ error: "ai_failed", detail: String(err).slice(0, 200) }, { status: 502 });
  }

  return NextResponse.json({ result, action, credits: cost, remaining: spendRes.remaining });
}
