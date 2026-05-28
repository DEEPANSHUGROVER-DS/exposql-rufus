import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { proposals, type PricingRow } from "@/lib/db/schema";
import { ensureUserAndWorkspace } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function load(id: string, email: string | null | undefined, name: string | null | undefined, image: string | null | undefined) {
  if (!email) return null;
  const { workspace } = await ensureUserAndWorkspace({ email, name, image });
  const [row] = await db
    .select()
    .from(proposals)
    .where(and(eq(proposals.id, id), eq(proposals.workspaceId, workspace.id)))
    .limit(1);
  return row ? { workspaceId: workspace.id, row } : null;
}

const VALID_STATUS = new Set(["draft", "sent", "won", "lost"]);

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  const { id } = await ctx.params;
  const found = await load(id, session?.user?.email, session?.user?.name, session?.user?.image);
  if (!found) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ proposal: found.row });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  const { id } = await ctx.params;
  const found = await load(id, session?.user?.email, session?.user?.name, session?.user?.image);
  if (!found) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const patch: Partial<typeof proposals.$inferInsert> = { updatedAt: new Date() };

  if (typeof body.clientName === "string") patch.clientName = body.clientName.trim();
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (body.sections && typeof body.sections === "object") patch.sections = body.sections;
  if (Array.isArray(body.pricing)) {
    patch.pricing = (body.pricing as Partial<PricingRow>[]).map((r, i) => ({
      id: typeof r?.id === "number" ? r.id : i + 1,
      item: String(r?.item ?? ""),
      qty: Math.max(1, Number(r?.qty) || 1),
      price: Math.max(0, Number(r?.price) || 0),
    }));
  }
  if (typeof body.status === "string" && VALID_STATUS.has(body.status)) patch.status = body.status;

  // Publish: client sends { publish: true } -> we set hosted_slug
  if (body.publish === true) {
    let slug = found.row.hostedSlug;
    if (!slug) {
      const base = slugify(`${found.row.clientName}-${found.row.title}`) || `proposal-${id.slice(0, 6)}`;
      // Append a short random suffix so slugs are non-guessable and unique enough
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    patch.hostedSlug = slug;
    if (!patch.status && found.row.status === "draft") patch.status = "sent";
  }

  await db.update(proposals).set(patch).where(eq(proposals.id, id));
  const [updated] = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return NextResponse.json({ proposal: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  const { id } = await ctx.params;
  const found = await load(id, session?.user?.email, session?.user?.name, session?.user?.image);
  if (!found) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.delete(proposals).where(eq(proposals.id, id));
  return NextResponse.json({ ok: true });
}
