import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { knowledgeEntries } from "@/lib/db/schema";
import { ensureUserAndWorkspace, spendCredits, grantCredits, listKnowledge } from "@/lib/db/queries";
import { ANTHROPIC_CONFIGURED } from "@/lib/ai/anthropic";
import { splitIntoEntries } from "@/lib/ai/knowledge";
import { knowledgeImportCost } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const FREE_KB_CAP = 3;

export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  if (!ANTHROPIC_CONFIGURED) return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });

  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const text = String(body?.text ?? "");
  if (!text.trim()) return NextResponse.json({ error: "empty_text" }, { status: 400 });

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  // Free plan cap on KB size — check before spending
  if (workspace.plan === "free") {
    const existing = await listKnowledge(workspace.id);
    if (existing.length >= FREE_KB_CAP) {
      return NextResponse.json({ error: "free_plan_knowledge_cap", cap: FREE_KB_CAP }, { status: 402 });
    }
  }

  // Estimate cost up front from rough block count, then reconcile after
  const roughBlocks = Math.max(1, text.split(/\n\s*\n/).filter((b) => b.trim()).length);
  const estimatedCost = knowledgeImportCost(roughBlocks);

  const spendRes = await spendCredits(workspace.id, estimatedCost, `Knowledge import (~${roughBlocks} entries estimated)`, "ai");
  if (!spendRes.ok) {
    return NextResponse.json({ error: "insufficient_credits", remaining: spendRes.remaining }, { status: 402 });
  }

  let entries;
  try {
    entries = await splitIntoEntries(text);
  } catch (err) {
    await grantCredits(workspace.id, estimatedCost, "Refund: knowledge import failed", "refund");
    return NextResponse.json({ error: "ai_failed", detail: String(err).slice(0, 200) }, { status: 502 });
  }

  // Reconcile cost based on actual entry count
  const actualCost = knowledgeImportCost(entries.length);
  if (actualCost < estimatedCost) {
    await grantCredits(workspace.id, estimatedCost - actualCost, "Refund: import returned fewer entries", "refund");
  } else if (actualCost > estimatedCost) {
    const top = await spendCredits(workspace.id, actualCost - estimatedCost, "Top-up: import returned more entries", "ai");
    // If they can't afford the top-up, we still keep what we generated — better UX than failing.
    if (!top.ok) {
      /* tolerate */
    }
  }

  // Respect the free-plan cap: insert up to (cap - existing) only, ignore the rest
  let slotsLeft = Infinity;
  if (workspace.plan === "free") {
    const existing = await listKnowledge(workspace.id);
    slotsLeft = Math.max(0, FREE_KB_CAP - existing.length);
  }

  const toInsert = entries.slice(0, slotsLeft);
  const inserted = toInsert.length
    ? await db
        .insert(knowledgeEntries)
        .values(
          toInsert.map((e) => ({
            workspaceId: workspace.id,
            title: e.title,
            body: e.body,
            tags: e.tags,
          })),
        )
        .returning()
    : [];

  return NextResponse.json({
    inserted: inserted.length,
    detected: entries.length,
    skipped: Math.max(0, entries.length - inserted.length),
    cost: actualCost,
    entries: inserted,
  });
}
