import { desc, eq } from "drizzle-orm";
import JSZip from "jszip";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import {
  contractReviews,
  creditLedger,
  creditPurchases,
  knowledgeEntries,
  proposals,
  rfpResponses,
  users,
} from "@/lib/db/schema";
import { ensureUserAndWorkspace } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GDPR-style data export — returns a ZIP of JSON files containing every row
 * tied to the signed-in user's workspace. Streams the response.
 */
export async function GET() {
  if (!DB_CONFIGURED) return new Response("database_not_configured", { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return new Response("unauthenticated", { status: 401 });

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  const [
    [user],
    knowledge,
    workspaceProposals,
    rfps,
    contracts,
    ledger,
    purchases,
  ] = await Promise.all([
    db.select().from(users).where(eq(users.email, session.user.email)).limit(1),
    db.select().from(knowledgeEntries).where(eq(knowledgeEntries.workspaceId, workspace.id)).orderBy(desc(knowledgeEntries.updatedAt)),
    db.select().from(proposals).where(eq(proposals.workspaceId, workspace.id)).orderBy(desc(proposals.updatedAt)),
    db.select().from(rfpResponses).where(eq(rfpResponses.workspaceId, workspace.id)).orderBy(desc(rfpResponses.updatedAt)),
    db.select().from(contractReviews).where(eq(contractReviews.workspaceId, workspace.id)).orderBy(desc(contractReviews.createdAt)),
    db.select().from(creditLedger).where(eq(creditLedger.workspaceId, workspace.id)).orderBy(desc(creditLedger.createdAt)),
    db.select().from(creditPurchases).where(eq(creditPurchases.workspaceId, workspace.id)).orderBy(desc(creditPurchases.createdAt)),
  ]);

  const zip = new JSZip();
  const stamp = new Date().toISOString().slice(0, 10);

  zip.file(
    "README.txt",
    `Rufus data export for ${session.user.email}
Generated ${new Date().toISOString()}

This archive contains every row stored in Rufus that's tied to your account.
JSON files are formatted with 2-space indentation for readability.

Files:
  user.json                Your user record
  workspace.json           Workspace + brand kit + plan state (no payment card data)
  knowledge.json           Your knowledge base entries
  proposals.json           All proposals
  rfp-responses.json       All saved RFP responses
  contract-reviews.json    All contract reviews
  credit-ledger.json       Every credit grant and spend
  credit-purchases.json    Stripe pack purchase history (no payment card data)
`,
  );
  zip.file("user.json", JSON.stringify(user ?? null, null, 2));
  zip.file("workspace.json", JSON.stringify(workspace, null, 2));
  zip.file("knowledge.json", JSON.stringify(knowledge, null, 2));
  zip.file("proposals.json", JSON.stringify(workspaceProposals, null, 2));
  zip.file("rfp-responses.json", JSON.stringify(rfps, null, 2));
  zip.file("contract-reviews.json", JSON.stringify(contracts, null, 2));
  zip.file("credit-ledger.json", JSON.stringify(ledger, null, 2));
  zip.file("credit-purchases.json", JSON.stringify(purchases, null, 2));

  const buf = await zip.generateAsync({ type: "uint8array" });
  return new Response(buf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="rufus-export-${stamp}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
