import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const pool = getPool();
    
    // Test basic connection
    const timeResult = await pool.query('SELECT NOW() as time');
    
    // Count briefs
    const briefsResult = await pool.query('SELECT COUNT(*) as count FROM briefs');
    
    // Get first brief if any exist
    const firstBriefResult = await pool.query('SELECT id, title, status FROM briefs LIMIT 1');
    
    res.status(200).json({
      success: true,
      database: {
        connected: true,
        currentTime: timeResult.rows[0].time,
        briefsCount: parseInt(briefsResult.rows[0].count),
        sampleBrief: firstBriefResult.rows[0] || null
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}