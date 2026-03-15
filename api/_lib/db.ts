import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../../shared/schema.js";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set - database operations will fail");
    throw new Error("Database not configured. Please set DATABASE_URL environment variable.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1, // Serverless needs minimal connections per function
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
  }

  if (!db) {
    db = drizzle(pool, { schema });
  }

  return db;
}

// Initialize db on module load if DATABASE_URL is set
// This ensures the db export is available for dynamic imports
if (process.env.DATABASE_URL) {
  try {
    db = getDb();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// Export db constant for dynamic imports in auth.ts and other modules
export { db };