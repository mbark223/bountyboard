import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const health = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
      error: null as string | null,
    },
    environment: {
      DATABASE_URL_set: !!process.env.DATABASE_URL,
    }
  };

  try {
    if (!process.env.DATABASE_URL) {
      health.status = 'error';
      health.database.error = 'DATABASE_URL not set';
      return res.status(503).json(health);
    }

    const pool = getPool();
    const result = await pool.query('SELECT NOW() as time, COUNT(*) as count FROM briefs');
    
    health.database.connected = true;
    health.status = 'healthy';
    health['briefs_count'] = parseInt(result.rows[0]?.count || '0');
    
    res.status(200).json(health);
  } catch (error: any) {
    health.status = 'error';
    health.database.error = error.message;
    res.status(503).json(health);
  }
}