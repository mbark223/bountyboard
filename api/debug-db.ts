import { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../api/_lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const results = {
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlLength: process.env.DATABASE_URL?.length || 0,
    dbUrlPreview: process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 30) + "..." : 
      "NOT SET",
    timestamp: new Date().toISOString(),
    testConnection: false,
    error: null as any
  };

  // Try to actually connect
  try {
    const db = getDb();
    // Try a simple query
    await db.execute("SELECT 1");
    results.testConnection = true;
  } catch (error: any) {
    results.error = {
      message: error.message,
      code: error.code,
      detail: error.detail
    };
  }

  res.json(results);
}