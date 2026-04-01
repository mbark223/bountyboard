import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let pool: Pool | null = null;

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL not configured' });
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false }
    });

    // Get all briefs directly from database
    const result = await pool.query(`
      SELECT id, slug, title, org_name, status, owner_id,
             (SELECT COUNT(*) FROM submissions WHERE brief_id = briefs.id) as submission_count
      FROM briefs
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      total_briefs: result.rows.length,
      briefs: result.rows
    });

  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to check briefs',
      message: error.message
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
