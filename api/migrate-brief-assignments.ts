import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

/**
 * Migration endpoint to create brief_assignments table
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let pool: Pool | null = null;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('[Migration] Creating brief_assignments table...');

    // Create the table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS brief_assignments (
        id SERIAL PRIMARY KEY,
        brief_id INTEGER NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
        influencer_id INTEGER NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
        assigned_by TEXT NOT NULL,
        assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
        viewed_at TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'assigned',
        UNIQUE(brief_id, influencer_id)
      )
    `);

    console.log('[Migration] Creating indexes...');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_brief_assignments_brief_id
      ON brief_assignments(brief_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_brief_assignments_influencer_id
      ON brief_assignments(influencer_id)
    `);

    console.log('[Migration] brief_assignments table created successfully');

    return res.status(200).json({
      success: true,
      message: 'brief_assignments table created successfully'
    });

  } catch (error: any) {
    console.error('[Migration] Error:', error);
    return res.status(500).json({
      error: 'Migration failed',
      message: error.message
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
