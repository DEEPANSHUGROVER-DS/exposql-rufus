import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth, signOut } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { users, workspaces } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Self-serve account deletion.
 *
 * Requires the user to type their email in the request body as a confirmation
 * — this is a destructive action and we don't want one stray click to wipe a
 * workspace.
 *
 * Cascades via the FK ON DELETE CASCADE chain — deleting the user row
 * removes their workspace, which removes all child rows.
 */
export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const confirm = String(body?.confirmEmail ?? "").trim().toLowerCase();
  if (confirm !== session.user.email.toLowerCase()) {
    return NextResponse.json({ error: "confirmation_mismatch" }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  // Mark deletion-requested first so anything observing the workspace can
  // refuse new writes. Then delete the user row — FK cascades wipe the
  // workspace + all child rows (knowledge, proposals, RFP responses,
  // contract reviews, ledger, credit purchases).
  await db.update(workspaces).set({ deletionRequestedAt: new Date() }).where(eq(workspaces.ownerId, user.id));
  await db.delete(users).where(eq(users.id, user.id));

  // Sign the user out — the session cookie will be cleared by the caller
  // following up with a sign-out request, but we also attempt it here.
  try {
    await signOut({ redirect: false });
  } catch {
    /* tolerate */
  }

  return NextResponse.json({ ok: true });
}
