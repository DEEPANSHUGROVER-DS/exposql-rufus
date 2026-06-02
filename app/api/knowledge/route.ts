import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { knowledgeEntries } from "@/lib/db/schema";
import { ensureUserAndWorkspace, listKnowledge } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });
  const entries = await listKnowledge(workspace.id);
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json();
  if (!body?.title?.trim()) return NextResponse.json({ error: "title_required" }, { status: 400 });

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  // Pay-as-you-go: no KB cap. The user pays per RFP call, so they're
  // naturally bounded by their own spend — no need for an arbitrary count
  // limit.

  const [created] = await db
    .insert(knowledgeEntries)
    .values({
      workspaceId: workspace.id,
      title: String(body.title).trim(),
      body: String(body.body ?? ""),
      tags: Array.isArray(body.tags) ? body.tags.filter(Boolean) : [],
    })
    .returning();
  return NextResponse.json({ entry: created });
}
