import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { knowledgeEntries } from "@/lib/db/schema";
import { ensureUserAndWorkspace } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function authorized(id: string, email: string | null | undefined, name: string | null | undefined, image: string | null | undefined) {
  if (!email) return null;
  const { workspace } = await ensureUserAndWorkspace({ email, name, image });
  const [entry] = await db
    .select()
    .from(knowledgeEntries)
    .where(and(eq(knowledgeEntries.id, id), eq(knowledgeEntries.workspaceId, workspace.id)))
    .limit(1);
  return entry ? { workspaceId: workspace.id, entry } : null;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  const { id } = await ctx.params;
  const ok = await authorized(id, session?.user?.email, session?.user?.name, session?.user?.image);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json();
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.body === "string") patch.body = body.body;
  if (Array.isArray(body.tags)) patch.tags = body.tags.filter(Boolean);

  const [updated] = await db.update(knowledgeEntries).set(patch).where(eq(knowledgeEntries.id, id)).returning();
  return NextResponse.json({ entry: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  const { id } = await ctx.params;
  const ok = await authorized(id, session?.user?.email, session?.user?.name, session?.user?.image);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.delete(knowledgeEntries).where(eq(knowledgeEntries.id, id));
  return NextResponse.json({ ok: true });
}
