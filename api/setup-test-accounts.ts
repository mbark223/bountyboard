import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

/**
 * Setup Test Accounts Endpoint
 *
 * Creates admin@test.com and influencer@test.com accounts for demo purposes
 *
 * Usage: GET /api/setup-test-accounts
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
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

    console.log('[Setup] Creating test accounts...');

    // Create admin account
    await pool.query(`
      INSERT INTO users (id, email, first_name, last_name, user_type, role, is_onboarded, email_verified, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        'admin@test.com',
        'Test',
        'Admin',
        'admin',
        'admin',
        true,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        user_type = 'admin',
        role = 'admin',
        is_onboarded = true,
        email_verified = true,
        updated_at = NOW()
    `);

    console.log('[Setup] Admin account created/updated');

    // Create influencer record
    await pool.query(`
      INSERT INTO influencers (
        first_name,
        last_name,
        email,
        phone,
        instagram_handle,
        tiktok_handle,
        instagram_followers,
        status,
        id_verified,
        bank_verified,
        applied_at,
        approved_at
      )
      VALUES (
        'Test',
        'Influencer',
        'influencer@test.com',
        '+1 (555) 123-4567',
        'testinfluencer',
        'testinfluencer',
        10000,
        'approved',
        1,
        1,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        status = 'approved',
        id_verified = 1,
        bank_verified = 1,
        approved_at = NOW()
    `);

    console.log('[Setup] Influencer record created/updated');

    // Create influencer user account
    await pool.query(`
      INSERT INTO users (id, email, first_name, last_name, user_type, role, influencer_id, is_onboarded, email_verified, created_at, updated_at)
      SELECT
        gen_random_uuid(),
        i.email,
        i.first_name,
        i.last_name,
        'influencer',
        'admin',
        i.id,
        true,
        true,
        NOW(),
        NOW()
      FROM influencers i
      WHERE i.email = 'influencer@test.com'
      ON CONFLICT (email) DO UPDATE SET
        user_type = 'influencer',
        influencer_id = (SELECT id FROM influencers WHERE email = 'influencer@test.com'),
        is_onboarded = true,
        email_verified = true,
        updated_at = NOW()
    `);

    console.log('[Setup] Influencer user account created/updated');

    // Verify accounts
    const result = await pool.query(`
      SELECT email, first_name, last_name, user_type, role
      FROM users
      WHERE email IN ('admin@test.com', 'influencer@test.com')
      ORDER BY email
    `);

    return res.status(200).json({
      success: true,
      message: 'Test accounts created/updated successfully',
      accounts: result.rows,
      credentials: {
        admin: 'admin@test.com',
        influencer: 'influencer@test.com'
      }
    });

  } catch (error: any) {
    console.error('[Setup] Error creating test accounts:', error);
    return res.status(500).json({
      error: 'Failed to create test accounts',
      message: error.message
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
