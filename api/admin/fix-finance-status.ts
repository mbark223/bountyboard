import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { getUser } from '../_lib/auth';

/**
 * One-time migration to set financeApprovalStatus = 'pending' for all SELECTED submissions
 * GET /api/admin/fix-finance-status
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
    // Check authentication
    const user = await getUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (user.userType !== 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false }
    });

    console.log('[Fix Finance Status] Starting migration...');

    // Update all SELECTED submissions that don't have financeApprovalStatus set
    const result = await pool.query(`
      UPDATE submissions
      SET finance_approval_status = 'pending'
      WHERE status = 'SELECTED'
        AND (finance_approval_status IS NULL OR finance_approval_status = '')
      RETURNING id, creator_name, finance_approval_status
    `);

    console.log(`[Fix Finance Status] Updated ${result.rowCount} submissions`);

    return res.status(200).json({
      success: true,
      updated: result.rowCount,
      submissions: result.rows
    });

  } catch (error: any) {
    console.error('[Fix Finance Status] Error:', error);
    return res.status(500).json({
      error: 'Failed to fix finance status',
      message: error.message
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
