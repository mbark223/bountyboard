import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

/**
 * TEST/DEV LOGIN ENDPOINT
 *
 * ⚠️ WARNING: This is for development/testing only!
 * Allows logging in with just an email address for testing purposes.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  let pool: Pool | null = null;

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if we're in production and test login is disabled
    // For demo purposes, test login is enabled by default
    // Set DISABLE_TEST_LOGIN=true to disable it
    if (process.env.DISABLE_TEST_LOGIN === 'true') {
      return res.status(403).json({
        error: 'Test login is disabled'
      });
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

    console.log('[Test Login] Looking up user:', email);

    // Find user by email
    const query = `
      SELECT
        id,
        email,
        first_name,
        last_name,
        user_type,
        role,
        is_onboarded,
        org_name,
        org_slug,
        org_logo_url
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      console.log('[Test Login] User not found:', email);
      return res.status(404).json({
        error: 'No user found with this email'
      });
    }

    const user = result.rows[0];

    console.log(`[Test Login] User found: ${email} (${user.user_type})`);

    // For Vercel serverless, we'll return user data and let the client handle state
    // In a real app, we'd create a session or JWT token here
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        role: user.role,
        isOnboarded: user.is_onboarded,
        orgName: user.org_name,
        orgSlug: user.org_slug,
        orgLogoUrl: user.org_logo_url
      }
    });

  } catch (error: any) {
    console.error('[Test Login] Error:', error);
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
