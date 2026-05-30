import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { auth } from "@/auth";
import { db, DB_CONFIGURED } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { ensureUserAndWorkspace } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const BLOB_CONFIGURED = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const MAX_BYTES = 1.5 * 1024 * 1024; // 1.5 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/svg+xml", "image/webp"]);

export async function POST(req: Request) {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  if (!BLOB_CONFIGURED) {
    return NextResponse.json(
      { error: "blob_not_configured", message: "Logo upload is disabled — set BLOB_READ_WRITE_TOKEN on Vercel." },
      { status: 503 },
    );
  }
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large", maxBytes: MAX_BYTES }, { status: 413 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "unsupported_type", allowed: Array.from(ALLOWED) }, { status: 400 });
  }

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  // Delete the previous blob if we had one
  if (workspace.logoBlobUrl) {
    try {
      await del(workspace.logoBlobUrl);
    } catch {
      /* tolerate */
    }
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const key = `logos/${workspace.id}-${Date.now()}.${ext}`;
  const blob = await put(key, file, { access: "public", contentType: file.type });

  await db
    .update(workspaces)
    .set({ logoUrl: blob.url, logoBlobUrl: blob.url })
    .where(eq(workspaces.id, workspace.id));

  return NextResponse.json({ url: blob.url });
}

export async function DELETE() {
  if (!DB_CONFIGURED) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { workspace } = await ensureUserAndWorkspace({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });

  if (workspace.logoBlobUrl && BLOB_CONFIGURED) {
    try {
      await del(workspace.logoBlobUrl);
    } catch {
      /* tolerate */
    }
  }
  await db.update(workspaces).set({ logoUrl: "", logoBlobUrl: null }).where(eq(workspaces.id, workspace.id));
  return NextResponse.json({ ok: true });
}
