import { and, eq } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import { ensureUserAndWorkspace } from "@/lib/db/queries";
import { ProposalPdf } from "@/lib/pdf/Proposal";
import type { PricingRow } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "proposal";
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!DB_CONFIGURED) return new Response("database_not_configured", { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return new Response("unauthenticated", { status: 401 });

  const { id } = await ctx.params;
  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const [row] = await db
    .select()
    .from(proposals)
    .where(and(eq(proposals.id, id), eq(proposals.workspaceId, workspace.id)))
    .limit(1);
  if (!row) return new Response("not_found", { status: 404 });

  const buffer = await renderToBuffer(
    <ProposalPdf
      proposal={{
        clientName: row.clientName,
        title: row.title,
        sections: row.sections as Record<string, string>,
        pricing: row.pricing as PricingRow[],
        createdAt: row.createdAt,
      }}
      workspace={{
        companyName: workspace.companyName,
        primaryColor: workspace.primaryColor,
        accentColor: workspace.accentColor,
        currency: workspace.currency,
      }}
    />,
  );

  const name = `${slugify(row.clientName)}-${slugify(row.title)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
