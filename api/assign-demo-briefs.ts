import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { getUser } from './_lib/auth';

/**
 * Assign Demo Briefs to Current User
 *
 * Transfers ownership of demo briefs to the currently logged-in admin
 *
 * Usage: GET /api/assign-demo-briefs
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let pool: Pool | null = null;

  try {
    // Get current user
    const user = await getUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated. Please log in first.' });
    }

    if (user.userType !== 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can assign demo briefs' });
    }

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

    console.log('[Assign Demo] Transferring demo briefs to user:', user.email, user.id);

    // Transfer ownership of demo briefs to current user
    const result = await pool.query(`
      UPDATE briefs
      SET owner_id = $1, updated_at = NOW()
      WHERE slug IN ('pmr-new-years-2025', 'nfl-playoffs-hype', 'huff-n-puff-casino')
      RETURNING id, slug, title
    `, [user.id]);

    console.log('[Assign Demo] Transferred', result.rows.length, 'briefs');

    return res.status(200).json({
      success: true,
      message: `Successfully assigned ${result.rows.length} demo briefs to ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      },
      briefs: result.rows
    });

  } catch (error: any) {
    console.error('[Assign Demo] Error:', error);
    return res.status(500).json({
      error: 'Failed to assign demo briefs',
      message: error.message
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
