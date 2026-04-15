import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

/**
 * Talent Portal Endpoint
 * GET /api/talents/portal?email=xxx
 *
 * Returns talent info and their assigned briefs (not all briefs)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let pool: Pool | null = null;

  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false }
    });

    console.log('[Talent Portal] Fetching data for:', email);

    // Get talent by email
    const talentResult = await pool.query(
      `SELECT id, first_name, last_name, email, instagram_handle, status
       FROM influencers
       WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (talentResult.rowCount === 0) {
      return res.status(404).json({ error: 'Talent not found with this email' });
    }

    const talent = talentResult.rows[0];

    // Only approved talents can access the portal
    if (talent.status !== 'approved') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your talent application is still pending approval'
      });
    }

    // Get assigned briefs for this talent
    const briefsResult = await pool.query(
      `SELECT
        b.id,
        b.slug,
        b.title,
        b.org_name as "orgName",
        b.overview,
        b.requirements,
        b.deliverable_ratio as "deliverableRatio",
        b.deliverable_length as "deliverableLength",
        b.deliverable_format as "deliverableFormat",
        b.reward_type as "rewardType",
        b.reward_amount as "rewardAmount",
        b.reward_currency as "rewardCurrency",
        b.reward_description as "rewardDescription",
        b.deadline,
        b.status,
        ba.assigned_at as "assignedAt",
        (SELECT COUNT(*) FROM submissions WHERE brief_id = b.id AND creator_email = $1) as "submissionCount"
      FROM brief_assignments ba
      JOIN briefs b ON ba.brief_id = b.id
      WHERE ba.influencer_id = $2
        AND b.status = 'PUBLISHED'
      ORDER BY ba.assigned_at DESC`,
      [email, talent.id]
    );

    console.log(`[Talent Portal] Found ${briefsResult.rowCount} assigned briefs for talent ${talent.id}`);

    // Transform to match expected format
    const briefs = briefsResult.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      orgName: row.orgName,
      overview: row.overview,
      requirements: row.requirements,
      deliverableRatio: row.deliverableRatio,
      deliverableLength: row.deliverableLength,
      deliverableFormat: row.deliverableFormat,
      reward: {
        type: row.rewardType,
        amount: row.rewardAmount,
        currency: row.rewardCurrency,
        description: row.rewardDescription
      },
      deadline: row.deadline,
      status: row.status,
      assignedAt: row.assignedAt,
      submissionCount: parseInt(row.submissionCount) || 0
    }));

    return res.status(200).json({
      talent: {
        id: talent.id,
        firstName: talent.first_name,
        lastName: talent.last_name,
        email: talent.email,
        instagramHandle: talent.instagram_handle,
        status: talent.status
      },
      briefs
    });

  } catch (error: any) {
    console.error('[Talent Portal] Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch portal data',
      message: error.message
    });
  } finally {
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        console.error('[Talent Portal] Error closing pool:', e);
      }
    }
  }
}
