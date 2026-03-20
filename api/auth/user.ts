import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

/**
 * Get current authenticated user from test-login session
 * This endpoint is called by the frontend to check authentication status
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
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  let pool: Pool | null = null;

  try {
    // Get user email from query parameter (set by test-login)
    // In a real app, this would come from a session or JWT token
    const email = req.cookies?.['user_email'];

    if (!email) {
      return res.status(401).json({ error: 'Not authenticated' });
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

    // Get user from database
    const query = `
      SELECT
        id,
        email,
        first_name,
        last_name,
        user_type,
        role,
        is_onboarded,
        influencer_id,
        org_name,
        org_slug,
        org_logo_url
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      role: user.role,
      isOnboarded: user.is_onboarded,
      influencerId: user.influencer_id,
      orgName: user.org_name,
      orgSlug: user.org_slug,
      orgLogoUrl: user.org_logo_url
    });

  } catch (error: any) {
    console.error('[Auth User] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}