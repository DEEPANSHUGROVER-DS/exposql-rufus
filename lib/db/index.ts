import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Eager Drizzle init (no Proxy) — using a placeholder when the env is
 * missing so the module loads cleanly at build time; any real query against
 * an unconfigured client will fail at call time, not at import time.
 */
const url = process.env.DATABASE_URL || "postgres://placeholder@invalid/none";
const client = neon(url);

export const db = drizzle(client, { schema });
export const DB_CONFIGURED = Boolean(process.env.DATABASE_URL);
export { schema };
