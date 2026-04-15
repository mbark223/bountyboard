import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { getUser } from '../_lib/auth';

/**
 * Migration to add finance approval columns to submissions table
 * GET /api/admin/migrate-finance-columns
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

    console.log('[Finance Migration] Starting migration...');

    // Add finance approval columns if they don't exist
    const migrations = [
      `ALTER TABLE submissions ADD COLUMN IF NOT EXISTS finance_approval_status TEXT DEFAULT 'pending'`,
      `ALTER TABLE submissions ADD COLUMN IF NOT EXISTS finance_approved_by TEXT`,
      `ALTER TABLE submissions ADD COLUMN IF NOT EXISTS finance_approved_at TIMESTAMP`,
      `ALTER TABLE submissions ADD COLUMN IF NOT EXISTS finance_approval_notes TEXT`,
    ];

    const results = [];
    for (const migration of migrations) {
      try {
        await pool.query(migration);
        results.push({ sql: migration, success: true });
        console.log(`[Finance Migration] ✓ ${migration}`);
      } catch (error: any) {
        results.push({ sql: migration, success: false, error: error.message });
        console.error(`[Finance Migration] ✗ ${migration}:`, error.message);
      }
    }

    // Update existing SELECTED submissions to have finance_approval_status = 'pending'
    const updateResult = await pool.query(`
      UPDATE submissions
      SET finance_approval_status = 'pending'
      WHERE status = 'SELECTED'
        AND (finance_approval_status IS NULL OR finance_approval_status = '')
      RETURNING id, creator_name
    `);

    console.log(`[Finance Migration] Updated ${updateResult.rowCount} existing SELECTED submissions`);

    return res.status(200).json({
      success: true,
      migrations: results,
      updatedSubmissions: updateResult.rowCount,
      submissions: updateResult.rows
    });

  } catch (error: any) {
    console.error('[Finance Migration] Error:', error);
    return res.status(500).json({
      error: 'Migration failed',
      message: error.message,
      stack: error.stack
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
