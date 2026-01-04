import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_lib/db';
import { sql } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const status = {
    status: 'unknown',
    database: {
      connected: false,
      error: null as string | null,
    },
    environment: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
    briefsCount: 0,
    usersCount: 0,
    timestamp: new Date().toISOString(),
  };

  try {
    console.log("Health check: Testing database connection...");
    
    if (!process.env.DATABASE_URL) {
      status.database.error = "DATABASE_URL environment variable not set";
      status.status = 'error';
      res.status(503).json(status);
      return;
    }

    // Test database connection
    const db = getDb();
    const dbTest = await db.execute(sql`SELECT NOW() as current_time`);
    status.database.connected = true;
    
    // Count briefs
    try {
      const briefsResult = await db.execute(sql`SELECT COUNT(*) as count FROM briefs`);
      status.briefsCount = parseInt(briefsResult.rows[0]?.count as string || '0');
    } catch (e) {
      console.error("Error counting briefs:", e);
    }
    
    // Count users
    try {
      const usersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
      status.usersCount = parseInt(usersResult.rows[0]?.count as string || '0');
    } catch (e) {
      console.error("Error counting users:", e);
    }
    
    status.status = 'healthy';
    res.status(200).json(status);
    
  } catch (error) {
    console.error("Health check failed:", error);
    status.database.error = error instanceof Error ? error.message : 'Unknown database error';
    status.status = 'error';
    res.status(503).json(status);
  }
}