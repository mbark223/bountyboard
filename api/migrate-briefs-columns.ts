import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

/**
 * Migration endpoint to add missing columns to briefs table
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

    console.log('[Migration] Adding missing columns to briefs table...');

    // Add dos and donts columns
    try {
      await pool.query(`
        ALTER TABLE briefs ADD COLUMN IF NOT EXISTS dos TEXT[]
      `);
      console.log('[Migration] Added dos column');
    } catch (error) {
      console.log('[Migration] dos column may already exist');
    }

    try {
      await pool.query(`
        ALTER TABLE briefs ADD COLUMN IF NOT EXISTS donts TEXT[]
      `);
      console.log('[Migration] Added donts column');
    } catch (error) {
      console.log('[Migration] donts column may already exist');
    }

    console.log('[Migration] Briefs table updated successfully');

    return res.status(200).json({
      success: true,
      message: 'Briefs table updated successfully'
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
