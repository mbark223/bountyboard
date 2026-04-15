import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

/**
 * Get finance submissions WITHOUT AUTH - for debugging only
 * GET /api/admin/finance-no-auth
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-email');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let pool: Pool | null = null;

  try {
    console.log('[Finance No Auth] Starting...');

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL not configured' });
    }

    console.log('[Finance No Auth] Creating pool...');

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false }
    });

    console.log('[Finance No Auth] Pool created, running query...');

    const { status } = req.query;

    // Simple query first - just get SELECTED submissions
    const result = await pool.query(`
      SELECT
        s.id,
        s.creator_name as "creatorName",
        s.creator_email as "creatorEmail",
        s.status,
        s.payout_status as "payoutStatus"
      FROM submissions s
      WHERE s.status = 'SELECTED'
      ORDER BY s.id DESC
      LIMIT 10
    `);

    console.log(`[Finance No Auth] Query succeeded, found ${result.rowCount} rows`);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      submissions: result.rows
    });

  } catch (error: any) {
    console.error('[Finance No Auth] Error:', error);
    return res.status(500).json({
      error: 'Query failed',
      message: error.message,
      stack: error.stack,
      code: error.code
    });
  } finally {
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        console.error('[Finance No Auth] Error closing pool:', e);
      }
    }
  }
}
