import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import { ensureUserAndWorkspace, spendCredits, grantCredits, listKnowledge } from "@/lib/db/queries";
import { ANTHROPIC_CONFIGURED } from "@/lib/ai/anthropic";
import { generateProposal, PROPOSAL_SECTION_KEYS, type ProposalSectionKey } from "@/lib/ai/proposal";
import { proposalSectionCost } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

interface Row { item: string; qty: number; price: number }

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  if (!ANTHROPIC_CONFIGURED) return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });

  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const client = String(body?.client ?? "").trim();
  const title = String(body?.title ?? "").trim();
  const scope = String(body?.scope ?? "");
  const timeline = String(body?.timeline ?? "");
  const tone = String(body?.tone ?? "Friendly");
  const pricingRows: Row[] = Array.isArray(body?.pricingRows)
    ? body.pricingRows.map((r: Partial<Row>) => ({
        item: String(r?.item ?? ""),
        qty: Math.max(1, Number(r?.qty) || 1),
        price: Math.max(0, Number(r?.price) || 0),
      }))
    : [];

  const regenSectionOnly =
    typeof body?.regenSectionOnly === "string" && (PROPOSAL_SECTION_KEYS as readonly string[]).includes(body.regenSectionOnly)
      ? (body.regenSectionOnly as ProposalSectionKey)
      : undefined;

  if (!regenSectionOnly && (!client || !title)) {
    return NextResponse.json({ error: "client_and_title_required" }, { status: 400 });
  }

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const cost = regenSectionOnly
    ? proposalSectionCost(regenSectionOnly)
    : clamp(12 + Math.floor(scope.length / 200), 12, 20);

  const reason = regenSectionOnly
    ? `Proposal: regenerate "${regenSectionOnly}" (${cost}cr)`
    : `Proposal: ${title} for ${client}`;

  const spendRes = await spendCredits(workspace.id, cost, reason, "ai");
  if (!spendRes.ok) {
    return NextResponse.json({ error: "insufficient_credits", remaining: spendRes.remaining }, { status: 402 });
  }

  const knowledge = await listKnowledge(workspace.id);

  let sections;
  try {
    sections = await generateProposal({
      workspace: {
        companyName: workspace.companyName,
        industry: workspace.industry,
        defaultTone: workspace.defaultTone,
        services: workspace.services,
        currency: workspace.currency,
      },
      knowledge,
      client,
      title,
      scope,
      timeline,
      pricingRows,
      tone,
      regenSectionOnly,
    });
  } catch (err) {
    await grantCredits(workspace.id, cost, "Refund: proposal generation failed", "refund");
    return NextResponse.json({ error: "ai_failed", detail: String(err).slice(0, 200) }, { status: 502 });
  }

  // Section regen: don't create a new row, just return the section text.
  if (regenSectionOnly) {
    return NextResponse.json({ sections, remaining: spendRes.remaining });
  }

  const [saved] = await db
    .insert(proposals)
    .values({
      workspaceId: workspace.id,
      clientName: client,
      title,
      scope,
      timeline,
      tone,
      sections,
      pricing: pricingRows.map((r, i) => ({ id: i + 1, ...r })),
      status: "draft",
    })
    .returning();

  return NextResponse.json({ id: saved.id, sections, remaining: spendRes.remaining });
}
