import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { getUser } from '../_lib/auth';

/**
 * Test endpoint to debug finance submissions query
 * GET /api/admin/test-finance-query
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

    console.log('[Test Finance Query] User authenticated:', user.email);

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false }
    });

    console.log('[Test Finance Query] Database connection created');

    // First, check if finance columns exist
    const columnsCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'submissions'
        AND column_name IN ('finance_approval_status', 'finance_approved_by', 'finance_approved_at', 'finance_approval_notes')
    `);

    console.log('[Test Finance Query] Finance columns found:', columnsCheck.rows);

    // Get all SELECTED submissions with minimal fields first
    const simpleResult = await pool.query(`
      SELECT
        s.id,
        s.creator_name,
        s.status,
        s.payout_status
      FROM submissions s
      WHERE s.status = 'SELECTED'
      ORDER BY s.id DESC
      LIMIT 10
    `);

    console.log(`[Test Finance Query] Found ${simpleResult.rowCount} SELECTED submissions`);

    // Try full query
    const fullResult = await pool.query(`
      SELECT
        s.id,
        s.creator_name as "creatorName",
        s.creator_email as "creatorEmail",
        s.creator_handle as "creatorHandle",
        s.brief_id as "briefId",
        b.title as "briefTitle",
        s.status,
        s.payout_status as "payoutStatus",
        s.finance_approval_status as "financeApprovalStatus",
        s.finance_approved_by as "financeApprovedBy",
        s.finance_approved_at as "financeApprovedAt",
        s.paid_at as "paidAt",
        s.selected_at as "selectedAt",
        s.payout_notes as "payoutNotes",
        b.reward_type as "rewardType",
        b.reward_amount as "rewardAmount",
        b.reward_currency as "rewardCurrency",
        b.reward_description as "rewardDescription"
      FROM submissions s
      LEFT JOIN briefs b ON s.brief_id = b.id
      WHERE s.status = 'SELECTED'
      ORDER BY s.selected_at DESC
      LIMIT 10
    `);

    console.log(`[Test Finance Query] Full query returned ${fullResult.rowCount} rows`);

    return res.status(200).json({
      success: true,
      columnsExist: columnsCheck.rows,
      simpleQueryCount: simpleResult.rowCount,
      simpleRows: simpleResult.rows,
      fullQueryCount: fullResult.rowCount,
      fullRows: fullResult.rows
    });

  } catch (error: any) {
    console.error('[Test Finance Query] Error:', error);
    return res.status(500).json({
      error: 'Query failed',
      message: error.message,
      stack: error.stack,
      code: error.code
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
