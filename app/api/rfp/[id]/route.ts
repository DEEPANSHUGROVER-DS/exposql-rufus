import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { rfpResponses, type RfpAnswer } from "@/lib/db/schema";
import { ensureUserAndWorkspace } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function load(id: string, email: string | null | undefined, name: string | null | undefined, image: string | null | undefined) {
  if (!email) return null;
  const { workspace } = await ensureUserAndWorkspace({ email, name, image });
  const [row] = await db
    .select()
    .from(rfpResponses)
    .where(and(eq(rfpResponses.id, id), eq(rfpResponses.workspaceId, workspace.id)))
    .limit(1);
  return row ? { workspaceId: workspace.id, row } : null;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  const { id } = await ctx.params;
  const found = await load(id, session?.user?.email, session?.user?.name, session?.user?.image);
  if (!found) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ rfp: found.row });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  const { id } = await ctx.params;
  const found = await load(id, session?.user?.email, session?.user?.name, session?.user?.image);
  if (!found) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const patch: Partial<typeof rfpResponses.$inferInsert> = { updatedAt: new Date() };

  if (typeof body.title === "string") patch.title = body.title.trim();
  if (Array.isArray(body.answers)) {
    patch.answers = body.answers.map((a: Partial<RfpAnswer>) => ({
      question: String(a?.question ?? ""),
      answer: String(a?.answer ?? ""),
      confidence: (a?.confidence === "high" || a?.confidence === "medium" ? a.confidence : "low") as RfpAnswer["confidence"],
      sourceEntryId: a?.sourceEntryId ?? null,
      approved: Boolean(a?.approved),
    }));
  }
  if (typeof body.status === "string") patch.status = body.status;

  await db.update(rfpResponses).set(patch).where(eq(rfpResponses.id, id));
  const [updated] = await db.select().from(rfpResponses).where(eq(rfpResponses.id, id)).limit(1);
  return NextResponse.json({ rfp: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  const { id } = await ctx.params;
  const found = await load(id, session?.user?.email, session?.user?.name, session?.user?.image);
  if (!found) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.delete(rfpResponses).where(eq(rfpResponses.id, id));
  return NextResponse.json({ ok: true });
}
