import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("DATABASE_URL not set - database features will be unavailable");
}

// Configure pool with retry logic for production
const poolConfig: pg.PoolConfig = databaseUrl ? {
  connectionString: databaseUrl,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
} : {};

export const pool = databaseUrl ? new Pool(poolConfig) : null;
export const db = pool ? drizzle(pool, { schema }) : null;
