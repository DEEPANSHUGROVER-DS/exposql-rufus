import { and, eq } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { contractReviews } from "@/lib/db/schema";
import { ensureUserAndWorkspace } from "@/lib/db/queries";
import { ContractReviewPdf } from "@/lib/pdf/ContractReview";
import type { RedFlag, SuggestedEdit } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "contract-review";
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
    .from(contractReviews)
    .where(and(eq(contractReviews.id, id), eq(contractReviews.workspaceId, workspace.id)))
    .limit(1);
  if (!row) return new Response("not_found", { status: 404 });

  const buffer = await renderToBuffer(
    <ContractReviewPdf
      review={{
        title: row.title,
        fileName: row.fileName,
        summary: row.summary as string[],
        redFlags: row.redFlags as RedFlag[],
        suggestedEdits: row.suggestedEdits as SuggestedEdit[],
        createdAt: row.createdAt,
      }}
      workspace={{
        companyName: workspace.companyName,
        primaryColor: workspace.primaryColor,
        accentColor: workspace.accentColor,
      }}
    />,
  );

  const name = `contract-review-${slugify(row.title)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
