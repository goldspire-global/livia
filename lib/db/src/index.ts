import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as coreSchema from "./schema";
import * as auditLogSchema from "@workspace/audit-log/schema";
import * as evalSchema from "@workspace/eval/schema";

const { Pool } = pg;

// Prefer SUPABASE_DATABASE_URL (Supabase EU pooler, ADR 0018 EU residency).
// Fall back to DATABASE_URL for legacy environments.
const connectionString =
  process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "SUPABASE_DATABASE_URL (preferred) or DATABASE_URL must be set. " +
      "Did you forget to provision the Supabase project?",
  );
}

function poolSsl(connectionString: string): false | { rejectUnauthorized: false } {
  try {
    const normalized = connectionString.replace(/^postgresql:\/\//, "postgres://");
    const host = new URL(normalized).hostname;
    if (host === "localhost" || host === "127.0.0.1") return false;
  } catch {
    /* keep Supabase SSL default below */
  }
  return { rejectUnauthorized: false };
}

export const pool = new Pool({
  connectionString,
  ssl: poolSsl(connectionString),
});

export const schema = {
  ...coreSchema,
  ...auditLogSchema,
  ...evalSchema,
};

export const db = drizzle(pool, { schema });

export * from "./schema";
export * from "@workspace/audit-log/schema";
export * from "@workspace/eval/schema";
