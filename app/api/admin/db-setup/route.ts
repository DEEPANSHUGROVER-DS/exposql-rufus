import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { INIT_SQL } from "@/lib/db/sql";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Idempotent bootstrap. Hit this once with the SETUP_TOKEN header after
 * provisioning Neon and the DB will have every Rufus table. Safe to re-run.
 */
export async function POST(req: Request) {
  const token = req.headers.get("x-setup-token");
  if (!process.env.SETUP_TOKEN || token !== process.env.SETUP_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "database_url_missing" }, { status: 500 });
  }
  const sql = neon(process.env.DATABASE_URL);
  const statements = INIT_SQL.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
  const results: { sql: string; ok: boolean; error?: string }[] = [];
  for (const stmt of statements) {
    try {
      await sql.query(stmt);
      results.push({ sql: stmt.slice(0, 80), ok: true });
    } catch (e) {
      results.push({ sql: stmt.slice(0, 80), ok: false, error: String(e).slice(0, 200) });
    }
  }
  return NextResponse.json({ ok: results.every((r) => r.ok), results });
}
