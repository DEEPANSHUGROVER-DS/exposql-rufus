import { NextResponse } from "next/server";
import { and, eq, ilike, or, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { knowledgeEntries, proposals, rfpResponses, contractReviews } from "@/lib/db/schema";
import { ensureUserAndWorkspace } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Hit {
  kind: "knowledge" | "proposal" | "rfp" | "contract";
  id: string;
  title: string;
  snippet: string;
  href: string;
  updatedAt: number;
}

export async function GET(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const pat = `%${q}%`;
  const limit = 8;

  const [kbHits, propHits, rfpHits, contractHits] = await Promise.all([
    db
      .select()
      .from(knowledgeEntries)
      .where(
        and(
          eq(knowledgeEntries.workspaceId, workspace.id),
          or(ilike(knowledgeEntries.title, pat), ilike(knowledgeEntries.body, pat)),
        ),
      )
      .orderBy(desc(knowledgeEntries.updatedAt))
      .limit(limit),
    db
      .select()
      .from(proposals)
      .where(
        and(
          eq(proposals.workspaceId, workspace.id),
          or(ilike(proposals.clientName, pat), ilike(proposals.title, pat), ilike(proposals.scope, pat)),
        ),
      )
      .orderBy(desc(proposals.updatedAt))
      .limit(limit),
    db
      .select()
      .from(rfpResponses)
      .where(
        and(
          eq(rfpResponses.workspaceId, workspace.id),
          or(ilike(rfpResponses.title, pat), ilike(rfpResponses.sourceText, pat)),
        ),
      )
      .orderBy(desc(rfpResponses.updatedAt))
      .limit(limit),
    db
      .select()
      .from(contractReviews)
      .where(
        and(
          eq(contractReviews.workspaceId, workspace.id),
          or(ilike(contractReviews.title, pat), ilike(contractReviews.sourceText, pat)),
        ),
      )
      .orderBy(desc(contractReviews.createdAt))
      .limit(limit),
  ]);

  function snippet(text: string, max = 120): string {
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return text.slice(0, max);
    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + max - 40);
    return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
  }

  const hits: Hit[] = [];
  for (const k of kbHits)
    hits.push({
      kind: "knowledge",
      id: k.id,
      title: k.title,
      snippet: snippet(k.body || ""),
      href: "/app/knowledge",
      updatedAt: +new Date(k.updatedAt),
    });
  for (const p of propHits)
    hits.push({
      kind: "proposal",
      id: p.id,
      title: `${p.clientName} — ${p.title}`,
      snippet: snippet(p.scope || ""),
      href: `/app/proposals/${p.id}`,
      updatedAt: +new Date(p.updatedAt),
    });
  for (const r of rfpHits)
    hits.push({
      kind: "rfp",
      id: r.id,
      title: r.title,
      snippet: snippet(r.sourceText || ""),
      href: `/app/rfp/${r.id}`,
      updatedAt: +new Date(r.updatedAt),
    });
  for (const c of contractHits)
    hits.push({
      kind: "contract",
      id: c.id,
      title: c.title,
      snippet: snippet(c.sourceText || ""),
      href: `/app/contracts/${c.id}`,
      updatedAt: +new Date(c.createdAt),
    });
  hits.sort((a, b) => b.updatedAt - a.updatedAt);

  return NextResponse.json({ hits: hits.slice(0, 20) });
}
