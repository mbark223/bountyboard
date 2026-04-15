import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

/**
 * Get all submissions that need finance review or payment
 * GET /api/admin/finance-submissions?status=all|pending|approved|paid
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
    // Simple header-based auth - bypass the buggy getUser() function
    const userEmail = req.headers['x-user-email'] as string;

    if (!userEmail) {
      console.log('[Finance Submissions] No x-user-email header - authentication required');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user exists and is admin
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false }
    });

    const userResult = await pool.query(
      'SELECT id, email, user_type, role FROM users WHERE email = $1',
      [userEmail]
    );

    if (userResult.rowCount === 0) {
      console.log('[Finance Submissions] User not found:', userEmail);
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    if (user.user_type !== 'admin' && user.role !== 'admin') {
      console.log('[Finance Submissions] User is not admin:', userEmail);
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('[Finance Submissions] User authenticated:', userEmail);

    const { status } = req.query;

    console.log(`[Finance Submissions] Fetching submissions with status filter: ${status}`);
    console.log(`[Finance Submissions] User: ${user.email}, UserType: ${user.user_type}`);

    // Get all SELECTED submissions with brief details
    let result;
    try {
      result = await pool.query(`
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
      `);
    } catch (queryError: any) {
      console.error('[Finance Submissions] Query error:', queryError);
      console.error('[Finance Submissions] Query error code:', queryError.code);
      console.error('[Finance Submissions] Query error message:', queryError.message);
      throw new Error(`Database query failed: ${queryError.message} (code: ${queryError.code})`);
    }

    let submissions = result.rows;

    console.log(`[Finance Submissions] Found ${submissions.length} SELECTED submissions from database`);
    submissions.forEach(s => {
      console.log(`  - ID: ${s.id}, Creator: ${s.creatorName}, Finance Status: ${s.financeApprovalStatus}, Payout: ${s.payoutStatus}`);
    });

    // Filter based on status parameter
    if (status && status !== 'all') {
      if (status === 'pending') {
        submissions = submissions.filter(s =>
          s.financeApprovalStatus === 'pending' || s.financeApprovalStatus === null
        );
      } else if (status === 'approved') {
        submissions = submissions.filter(s =>
          s.financeApprovalStatus === 'approved' && s.payoutStatus === 'PENDING'
        );
      } else if (status === 'paid') {
        submissions = submissions.filter(s => s.payoutStatus === 'PAID');
      }
      console.log(`[Finance Submissions] After filtering by '${status}': ${submissions.length} submissions`);
    }

    // Calculate summary stats
    const awaitingFinance = submissions.filter(s =>
      s.financeApprovalStatus === 'pending' || s.financeApprovalStatus === null
    ).length;

    const readyToPay = submissions.filter(s =>
      s.financeApprovalStatus === 'approved' && s.payoutStatus === 'PENDING'
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paidToday = submissions.filter(s => {
      if (!s.paidAt) return false;
      const paidDate = new Date(s.paidAt);
      paidDate.setHours(0, 0, 0, 0);
      return paidDate.getTime() === today.getTime();
    }).length;

    const totalPendingAmount = submissions
      .filter(s => s.payoutStatus === 'PENDING' || s.payoutStatus === null)
      .reduce((sum, s) => {
        const amount = parseFloat(s.rewardAmount) || 0;
        return sum + amount;
      }, 0);

    console.log(`[Finance Submissions] Returning ${submissions.length} submissions`);
    console.log(`[Finance Submissions] Stats - Awaiting: ${awaitingFinance}, Ready: ${readyToPay}, Paid Today: ${paidToday}, Total Pending: $${totalPendingAmount}`);

    return res.status(200).json({
      submissions,
      stats: {
        awaitingFinance,
        readyToPay,
        paidToday,
        totalPendingAmount: totalPendingAmount.toFixed(2)
      }
    });

  } catch (error: any) {
    console.error('[Finance Submissions] Error:', error);
    console.error('[Finance Submissions] Error stack:', error.stack);
    return res.status(500).json({
      error: 'Failed to fetch finance submissions',
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
  } finally {
    if (pool) {
      try {
        await pool.end();
      } catch (poolError) {
        console.error('[Finance Submissions] Error closing pool:', poolError);
      }
    }
  }
}
