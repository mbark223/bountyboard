import { VercelRequest, VercelResponse } from "@vercel/node";
import pg from "pg";

const { Pool } = pg;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const result: any = {
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlLength: process.env.DATABASE_URL?.length || 0,
    connection: false,
    error: null,
    tables: []
  };

  if (!process.env.DATABASE_URL) {
    return res.json({ ...result, error: "DATABASE_URL not configured" });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test basic connection
    const client = await pool.connect();
    result.connection = true;
    
    // Try to list tables
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    result.tables = tablesResult.rows.map(r => r.tablename);
    
    client.release();
  } catch (error: any) {
    result.error = {
      message: error.message,
      code: error.code
    };
  } finally {
    await pool.end();
  }

  res.json(result);
}