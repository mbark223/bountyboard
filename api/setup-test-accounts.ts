import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

/**
 * Setup Test Accounts Endpoint
 *
 * Creates complete demo environment:
 * - admin@test.com account
 * - influencer@test.com account (approved)
 * - Demo brief "Spring Product Launch Campaign"
 * - Assigns the brief to test influencer
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

    // Get admin user ID for brief ownership
    const adminResult = await pool.query(`
      SELECT id FROM users WHERE email = 'admin@test.com'
    `);
    const adminId = adminResult.rows[0]?.id;

    // Create a demo brief
    await pool.query(`
      INSERT INTO briefs (
        slug,
        title,
        org_name,
        business_line,
        overview,
        requirements,
        dos,
        donts,
        deliverable_ratio,
        deliverable_length,
        deliverable_format,
        reward_type,
        reward_amount,
        reward_currency,
        reward_description,
        deadline,
        status,
        max_winners,
        max_submissions_per_creator,
        owner_id,
        priority,
        creators_needed,
        platforms,
        created_at,
        updated_at
      )
      VALUES (
        'demo-campaign-2024',
        'Spring Product Launch Campaign',
        'BountyBoard Demo',
        'Marketing',
        'Create engaging social media content showcasing our new spring product line. Focus on authentic storytelling and lifestyle shots that resonate with our target demographic.',
        ARRAY['Show product in use', 'Include call-to-action', 'Use provided brand hashtags', 'Follow brand guidelines'],
        ARRAY['Show genuine enthusiasm', 'Feature products in good lighting', 'Include lifestyle shots', 'Be authentic and relatable'],
        ARRAY['Don''t mention competitors', 'Avoid negative language', 'Don''t use copyrighted music', 'No misleading claims'],
        '9:16',
        '30-60 seconds',
        'Vertical video',
        'CASH',
        500,
        'USD',
        '$500 per approved video',
        NOW() + INTERVAL '30 days',
        'PUBLISHED',
        5,
        3,
        $1,
        'High',
        5,
        ARRAY['Instagram', 'TikTok'],
        NOW(),
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        overview = EXCLUDED.overview,
        dos = EXCLUDED.dos,
        donts = EXCLUDED.donts,
        deadline = EXCLUDED.deadline,
        status = 'PUBLISHED',
        updated_at = NOW()
    `, [adminId]);

    console.log('[Setup] Demo brief created/updated');

    // Get brief and influencer IDs for assignment
    const briefResult = await pool.query(`
      SELECT id FROM briefs WHERE slug = 'demo-campaign-2024'
    `);
    const briefId = briefResult.rows[0]?.id;

    const influencerResult = await pool.query(`
      SELECT id FROM influencers WHERE email = 'influencer@test.com'
    `);
    const influencerId = influencerResult.rows[0]?.id;

    // Assign brief to test influencer
    if (briefId && influencerId && adminId) {
      await pool.query(`
        INSERT INTO brief_assignments (
          brief_id,
          influencer_id,
          assigned_by,
          assigned_at,
          status
        )
        VALUES ($1, $2, $3, NOW(), 'assigned')
        ON CONFLICT (brief_id, influencer_id) DO UPDATE SET
          assigned_at = NOW(),
          status = 'assigned'
      `, [briefId, influencerId, adminId]);

      console.log('[Setup] Brief assigned to test influencer');
    }

    // Verify accounts
    const result = await pool.query(`
      SELECT email, first_name, last_name, user_type, role
      FROM users
      WHERE email IN ('admin@test.com', 'influencer@test.com')
      ORDER BY email
    `);

    return res.status(200).json({
      success: true,
      message: 'Test accounts, brief, and assignment created successfully',
      accounts: result.rows,
      credentials: {
        admin: 'admin@test.com',
        influencer: 'influencer@test.com'
      },
      brief: {
        slug: 'demo-campaign-2024',
        title: 'Spring Product Launch Campaign',
        assignedTo: 'influencer@test.com'
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
