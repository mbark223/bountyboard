import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { getUser } from './_lib/auth';

/**
 * Get all briefs for admin with submission counts
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

    console.log(`[Admin Briefs] Fetching all briefs for ${user.email}`);

    // Get all briefs with submission counts
    const result = await pool.query(`
      SELECT
        b.*,
        COALESCE((SELECT COUNT(*) FROM submissions WHERE brief_id = b.id), 0) as submission_count
      FROM briefs b
      ORDER BY b.created_at DESC
    `);

    // Transform snake_case to camelCase
    const briefs = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      orgName: row.org_name,
      businessLine: row.business_line,
      state: row.state,
      overview: row.overview,
      requirements: row.requirements,
      dos: row.dos,
      donts: row.donts,
      deliverableRatio: row.deliverable_ratio,
      deliverableLength: row.deliverable_length,
      deliverableFormat: row.deliverable_format,
      reward: {
        type: row.reward_type,
        amount: row.reward_amount,
        currency: row.reward_currency,
        description: row.reward_description,
      },
      deadline: row.deadline,
      status: row.status,
      password: row.password,
      maxWinners: row.max_winners,
      maxSubmissionsPerCreator: row.max_submissions_per_creator,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      submissionCount: parseInt(row.submission_count) || 0
    }));

    console.log(`[Admin Briefs] Returning ${briefs.length} briefs`);

    return res.status(200).json(briefs);

  } catch (error: any) {
    console.error('[Admin Briefs] Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch briefs',
      message: error.message
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
