import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { contractReviews } from "@/lib/db/schema";
import { ensureUserAndWorkspace } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function load(id: string, email: string | null | undefined, name: string | null | undefined, image: string | null | undefined) {
  if (!email) return null;
  const { workspace } = await ensureUserAndWorkspace({ email, name, image });
  const [row] = await db
    .select()
    .from(contractReviews)
    .where(and(eq(contractReviews.id, id), eq(contractReviews.workspaceId, workspace.id)))
    .limit(1);
  return row ? { workspaceId: workspace.id, row } : null;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  const { id } = await ctx.params;
  const found = await load(id, session?.user?.email, session?.user?.name, session?.user?.image);
  if (!found) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ contract: found.row });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  const { id } = await ctx.params;
  const found = await load(id, session?.user?.email, session?.user?.name, session?.user?.image);
  if (!found) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.delete(contractReviews).where(eq(contractReviews.id, id));
  return NextResponse.json({ ok: true });
}
