import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@/db/schema";

const globalForDb = globalThis as typeof globalThis & {
  probePgPool?: pg.Pool;
};

export function getPgPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for the Postgres repository.");
  }

  globalForDb.probePgPool ??= new pg.Pool({
    connectionString,
    max: 5,
  });

  return globalForDb.probePgPool;
}

export function getDrizzleDb() {
  return drizzle(getPgPool(), { schema });
}
