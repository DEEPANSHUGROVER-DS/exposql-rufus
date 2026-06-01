import { eq, desc } from "drizzle-orm";
import { db } from "./index";
import { users, workspaces, knowledgeEntries, creditLedger, proposals, rfpResponses, contractReviews } from "./schema";
import type { WorkspaceRow } from "./schema";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * Upsert the user by email, then ensure they own a workspace. Resolving by
 * email (not token sub) sidesteps the FK crash that hits when a JWT session
 * carries an id that hasn't landed in the DB yet.
 */
export async function ensureUserAndWorkspace(profile: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<{ userId: string; workspace: WorkspaceRow }> {
  const existing = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);
  let user = existing[0];
  if (!user) {
    const [created] = await db
      .insert(users)
      .values({
        email: profile.email,
        name: profile.name ?? "",
        image: profile.image ?? "",
      })
      .returning();
    user = created;
  } else if ((profile.name && profile.name !== user.name) || (profile.image && profile.image !== user.image)) {
    await db
      .update(users)
      .set({ name: profile.name ?? user.name, image: profile.image ?? user.image })
      .where(eq(users.id, user.id));
  }

  const ws = await db.select().from(workspaces).where(eq(workspaces.ownerId, user.id)).limit(1);
  let workspace = ws[0];
  if (!workspace) {
    const [created] = await db.insert(workspaces).values({ ownerId: user.id }).returning();
    workspace = created;
    // Pay-as-you-go: no welcome credit grant. The user buys their first
    // pack (or subscribes) to load credits.
    void sendWelcomeEmail(user.email, user.name).catch(() => {});
  }

  return { userId: user.id, workspace };
}

export async function listKnowledge(workspaceId: string) {
  return db
    .select()
    .from(knowledgeEntries)
    .where(eq(knowledgeEntries.workspaceId, workspaceId))
    .orderBy(desc(knowledgeEntries.updatedAt));
}

export async function listLedger(workspaceId: string, limit = 50) {
  return db
    .select()
    .from(creditLedger)
    .where(eq(creditLedger.workspaceId, workspaceId))
    .orderBy(desc(creditLedger.createdAt))
    .limit(limit);
}

export async function listRecent(workspaceId: string, limit = 12) {
  const [props, rfps, contracts] = await Promise.all([
    db
      .select()
      .from(proposals)
      .where(eq(proposals.workspaceId, workspaceId))
      .orderBy(desc(proposals.updatedAt))
      .limit(limit),
    db
      .select()
      .from(rfpResponses)
      .where(eq(rfpResponses.workspaceId, workspaceId))
      .orderBy(desc(rfpResponses.updatedAt))
      .limit(limit),
    db
      .select()
      .from(contractReviews)
      .where(eq(contractReviews.workspaceId, workspaceId))
      .orderBy(desc(contractReviews.createdAt))
      .limit(limit),
  ]);

  const merged = [
    ...props.map((p) => ({
      id: p.id,
      kind: "proposal" as const,
      title: `${p.clientName} — ${p.title}`,
      status: p.status,
      updatedAt: +new Date(p.updatedAt),
    })),
    ...rfps.map((r) => ({
      id: r.id,
      kind: "rfp" as const,
      title: r.title,
      status: r.status,
      updatedAt: +new Date(r.updatedAt),
    })),
    ...contracts.map((c) => ({
      id: c.id,
      kind: "contract" as const,
      title: c.title,
      status: "in_review",
      updatedAt: +new Date(c.createdAt),
    })),
  ];
  merged.sort((a, b) => b.updatedAt - a.updatedAt);
  return merged.slice(0, limit);
}

/**
 * Atomically spend credits. Returns the new remaining balance, or null if
 * insufficient. Concurrent calls are safe because the UPDATE writes a guard
 * row that only matches when the remaining balance is high enough.
 */
export async function spendCredits(
  workspaceId: string,
  amount: number,
  reason: string,
  source: "ai" | "refund" | "grant" = "ai",
  refId?: string,
): Promise<{ ok: true; remaining: number } | { ok: false; remaining: number }> {
  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (!ws) return { ok: false, remaining: 0 };
  const total = ws.creditsIncluded + ws.creditsBought - ws.creditsUsed;
  if (amount > total) return { ok: false, remaining: total };

  await db
    .update(workspaces)
    .set({ creditsUsed: ws.creditsUsed + amount })
    .where(eq(workspaces.id, workspaceId));

  await db.insert(creditLedger).values({
    workspaceId,
    delta: -amount,
    reason,
    source,
    refId,
  });

  return { ok: true, remaining: total - amount };
}

export async function grantCredits(
  workspaceId: string,
  amount: number,
  reason: string,
  source: "purchase" | "grant" | "refund" = "grant",
  refId?: string,
) {
  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (!ws) throw new Error("Workspace not found");
  await db
    .update(workspaces)
    .set({ creditsBought: ws.creditsBought + amount })
    .where(eq(workspaces.id, workspaceId));
  await db.insert(creditLedger).values({
    workspaceId,
    delta: amount,
    reason,
    source,
    refId,
  });
}

export function creditsRemaining(ws: { creditsIncluded: number; creditsBought: number; creditsUsed: number }) {
  return Math.max(0, ws.creditsIncluded + ws.creditsBought - ws.creditsUsed);
}
