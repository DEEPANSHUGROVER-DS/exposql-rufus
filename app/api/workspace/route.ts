import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { workspaces, type WorkspaceRow } from "@/lib/db/schema";
import { ensureUserAndWorkspace, creditsRemaining, listLedger, listRecent, listKnowledge } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serialize(ws: WorkspaceRow) {
  return {
    id: ws.id,
    profile: {
      companyName: ws.companyName,
      website: ws.website,
      industry: ws.industry,
      services: ws.services,
      currency: ws.currency,
      defaultTone: ws.defaultTone,
      clientType: ws.clientType,
      onboardingComplete: Boolean(ws.onboardingCompletedAt),
      logoUrl: ws.logoUrl,
      primaryColor: ws.primaryColor,
      accentColor: ws.accentColor,
      theme: ws.theme,
    },
    plan: ws.plan,
    creditsIncluded: ws.creditsIncluded,
    creditsBought: ws.creditsBought,
    creditsUsed: ws.creditsUsed,
    remaining: creditsRemaining(ws),
  };
}

export async function GET() {
  if (!DB_CONFIGURED) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });
  const [knowledge, ledger, recent] = await Promise.all([
    listKnowledge(workspace.id),
    listLedger(workspace.id),
    listRecent(workspace.id),
  ]);
  return NextResponse.json({
    workspace: serialize(workspace),
    knowledge,
    ledger,
    recent,
  });
}

export async function PATCH(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json();
  const patch: Partial<typeof workspaces.$inferInsert> = {};
  if (typeof body.companyName === "string") patch.companyName = body.companyName;
  if (typeof body.website === "string") patch.website = body.website;
  if (typeof body.industry === "string") patch.industry = body.industry;
  if (Array.isArray(body.services)) patch.services = body.services.filter((s: unknown) => typeof s === "string");
  if (typeof body.currency === "string") patch.currency = body.currency;
  if (typeof body.defaultTone === "string") patch.defaultTone = body.defaultTone;
  if (typeof body.clientType === "string") patch.clientType = body.clientType;
  if (typeof body.logoUrl === "string") patch.logoUrl = body.logoUrl;
  if (typeof body.primaryColor === "string") patch.primaryColor = body.primaryColor;
  if (typeof body.accentColor === "string") patch.accentColor = body.accentColor;
  if (typeof body.theme === "string") patch.theme = body.theme;
  if (body.onboardingComplete === true) patch.onboardingCompletedAt = new Date();

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });
  await db.update(workspaces).set(patch).where(eq(workspaces.id, workspace.id));
  const [updated] = await db.select().from(workspaces).where(eq(workspaces.id, workspace.id)).limit(1);
  return NextResponse.json({ workspace: serialize(updated) });
}
