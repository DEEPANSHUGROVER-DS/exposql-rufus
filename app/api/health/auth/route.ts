import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DB_CONFIGURED, db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { STRIPE_CONFIGURED } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    AUTH_GOOGLE_ID: Boolean(process.env.AUTH_GOOGLE_ID),
    AUTH_GOOGLE_SECRET: Boolean(process.env.AUTH_GOOGLE_SECRET),
    STRIPE_SECRET_KEY: STRIPE_CONFIGURED,
    STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    NEXT_PUBLIC_SITE_URL: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  };

  let session: { email?: string | null } | null = null;
  try {
    const s = await auth();
    session = s?.user ? { email: s.user.email } : null;
  } catch (e) {
    session = { email: `error: ${String(e).slice(0, 80)}` };
  }

  let dbOk = false;
  let userCount: number | string = "unknown";
  if (DB_CONFIGURED) {
    try {
      const rows = await db.select().from(users).limit(1);
      dbOk = true;
      userCount = rows.length === 1 ? ">=1" : 0;
    } catch (e) {
      userCount = `error: ${String(e).slice(0, 80)}`;
    }
  }

  return NextResponse.json({ env, session, dbOk, userCount });
}
