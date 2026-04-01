import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

/**
 * Setup Complete Demo Data
 *
 * Creates:
 * - Admin account (admin@test.com)
 * - 3 published briefs with submissions
 * - Submissions in various states (received, selected, rejected)
 *
 * Usage: GET /api/setup-demo-data
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

    console.log('[Demo Setup] Starting...');

    // Create admin account
    await pool.query(`
      INSERT INTO users (id, email, first_name, last_name, user_type, role, org_name, is_onboarded, email_verified, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        'admin@test.com',
        'Test',
        'Admin',
        'admin',
        'admin',
        'BountyBoard Demo',
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

    console.log('[Demo Setup] Admin account created');

    // Get admin ID
    const adminResult = await pool.query(`SELECT id FROM users WHERE email = 'admin@test.com'`);
    const adminId = adminResult.rows[0]?.id;

    if (!adminId) {
      throw new Error('Failed to get admin ID');
    }

    // Create Brief 1: PMR New Years Campaign
    await pool.query(`
      INSERT INTO briefs (
        slug, title, org_name, business_line, state, overview, requirements,
        dos, donts,
        deliverable_ratio, deliverable_length, deliverable_format,
        reward_type, reward_amount, reward_currency, reward_description,
        deadline, status, max_winners, max_submissions_per_creator, owner_id,
        created_at, updated_at
      )
      VALUES (
        'pmr-new-years-2025',
        'PMR New Years 2025',
        'Hard Rock Bet',
        'PMR',
        'Florida',
        'Celebrate the New Year with Hard Rock Bet! Create engaging content showcasing your New Year betting traditions and resolutions.',
        ARRAY['Mention Hard Rock Bet app', 'Show responsible gaming message', 'Include #HardRockNewYear', 'Must be 21+ to participate'],
        ARRAY['Show genuine excitement', 'Feature the app prominently', 'Include New Year themed content'],
        ARRAY['Don''t encourage problem gambling', 'No underage participants', 'Avoid excessive drinking'],
        '9:16', '15-30 seconds', 'MP4 / 1080p',
        'BONUS_BETS', 1000, 'USD', 'in Free Bets',
        NOW() + INTERVAL '30 days', 'PUBLISHED', 5, 1, $1,
        NOW(), NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET status = 'PUBLISHED', updated_at = NOW()
    `, [adminId]);

    console.log('[Demo Setup] Brief 1 created');

    // Create Brief 2: NFL Playoffs
    await pool.query(`
      INSERT INTO briefs (
        slug, title, org_name, business_line, state, overview, requirements,
        dos, donts,
        deliverable_ratio, deliverable_length, deliverable_format,
        reward_type, reward_amount, reward_currency,
        deadline, status, max_winners, max_submissions_per_creator, owner_id,
        created_at, updated_at
      )
      VALUES (
        'nfl-playoffs-hype',
        'NFL Playoffs Hype',
        'FanDuel',
        'Sportsbook',
        'New Jersey',
        'Get fans pumped for the NFL playoffs! Show your game day setup and predictions for the wild card weekend.',
        ARRAY['Wear your team colors', 'Show FanDuel app on screen', 'Share your playoff predictions', 'High energy required', 'Include #FanDuelPlayoffs'],
        ARRAY['Show team spirit', 'Feature the FanDuel app', 'Share betting tips'],
        ARRAY['Don''t promote irresponsible betting', 'No competitor mentions', 'Avoid negative content'],
        '16:9 or 9:16', '30-60 seconds', 'MP4 / 4K preferred',
        'CASH', 750, 'USD',
        NOW() + INTERVAL '45 days', 'PUBLISHED', 10, 2, $1,
        NOW(), NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET status = 'PUBLISHED', updated_at = NOW()
    `, [adminId]);

    console.log('[Demo Setup] Brief 2 created');

    // Create Brief 3: Casino Game
    await pool.query(`
      INSERT INTO briefs (
        slug, title, org_name, business_line, state, overview, requirements,
        dos, donts,
        deliverable_ratio, deliverable_length, deliverable_format,
        reward_type, reward_amount, reward_currency, reward_description,
        deadline, status, max_winners, max_submissions_per_creator, owner_id,
        created_at, updated_at
      )
      VALUES (
        'huff-n-puff-casino',
        'Huff N Even More Puff',
        'BetMGM',
        'Casino',
        'Michigan',
        'Showcase the excitement of our Big Bad Wolf slot game! Create fairy tale themed content that highlights the thrill of the chase.',
        ARRAY['Reference the Three Little Pigs story', 'Show BetMGM Casino app', 'Mention the bonus features', 'Family-friendly content only', 'Use #HuffAndPuffBig'],
        ARRAY['Make it fun and engaging', 'Show the game interface', 'Keep it family-friendly'],
        ARRAY['No gambling addiction references', 'Avoid scary content', 'Don''t mention competitors'],
        '1:1', '15 seconds', 'MP4 / 1080p',
        'OTHER', 500, 'USD', '$500 in Casino Credits + Wolf Pack Merch',
        NOW() + INTERVAL '60 days', 'PUBLISHED', 7, 3, $1,
        NOW(), NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET status = 'PUBLISHED', updated_at = NOW()
    `, [adminId]);

    console.log('[Demo Setup] Brief 3 created');

    // Get brief IDs
    const briefIds = await pool.query(`
      SELECT id, slug FROM briefs
      WHERE slug IN ('pmr-new-years-2025', 'nfl-playoffs-hype', 'huff-n-puff-casino')
      ORDER BY slug
    `);

    const brief1Id = briefIds.rows.find(b => b.slug === 'pmr-new-years-2025')?.id;
    const brief2Id = briefIds.rows.find(b => b.slug === 'nfl-playoffs-hype')?.id;
    const brief3Id = briefIds.rows.find(b => b.slug === 'huff-n-puff-casino')?.id;

    // Create submissions for Brief 1
    if (brief1Id) {
      await pool.query(`
        INSERT INTO submissions (
          brief_id, creator_name, creator_email, creator_handle, creator_betting_account,
          message, video_url, video_file_name, video_mime_type, video_size_bytes,
          status, payout_status, submitted_at
        ) VALUES
        ($1, 'Sarah Jenkins', 'sarah.j@example.com', '@sarahcreates', 'sarah_bets',
         'Happy New Year from Hard Rock Bet! Here''s to winning big in 2025! 🎊 #HardRockNewYear',
         'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&h=450&fit=crop',
         'sarah-newyear.mp4', 'video/mp4', 15728640,
         'RECEIVED', 'NOT_APPLICABLE', NOW() - INTERVAL '2 days'),
        ($1, 'Mike Chen', 'mike.c@example.com', '@mike_vlogs', NULL,
         'New Year, new bets! Check out my Hard Rock experience.',
         'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=450&fit=crop',
         'mike-newyear.mp4', 'video/mp4', 18874368,
         'IN_REVIEW', 'NOT_APPLICABLE', NOW() - INTERVAL '1 day'),
        ($1, 'Jessica Torres', 'jessica.t@example.com', '@jessicavlogs', 'jess_hrb',
         'Bringing in 2025 with Hard Rock Bet! #HardRockNewYear',
         'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=450&fit=crop',
         'jessica-ny.mp4', 'video/mp4', 12582912,
         'RECEIVED', 'NOT_APPLICABLE', NOW() - INTERVAL '3 hours')
      `, [brief1Id]);
    }

    // Create submissions for Brief 2
    if (brief2Id) {
      await pool.query(`
        INSERT INTO submissions (
          brief_id, creator_name, creator_email, creator_handle,
          message, video_url, video_file_name, video_mime_type, video_size_bytes,
          status, payout_status, submitted_at
        ) VALUES
        ($1, 'David Martinez', 'david.m@example.com', '@davidfootball',
         'Who''s ready for the playoffs?! FanDuel has the best odds! #FanDuelPlayoffs',
         'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=450&fit=crop',
         'david-playoffs.mp4', 'video/mp4', 22020096,
         'RECEIVED', 'NOT_APPLICABLE', NOW() - INTERVAL '5 days'),
        ($1, 'Ashley Brown', 'ashley.b@example.com', '@ashsports',
         'My playoff predictions are in! Let''s go!',
         'https://images.unsplash.com/photo-1519766304817-4f37bfee532e?w=800&h=450&fit=crop',
         'ashley-picks.mp4', 'video/mp4', 19922944,
         'RECEIVED', 'NOT_APPLICABLE', NOW() - INTERVAL '4 days')
      `, [brief2Id]);
    }

    // Create submissions for Brief 3
    if (brief3Id) {
      await pool.query(`
        INSERT INTO submissions (
          brief_id, creator_name, creator_email, creator_handle,
          message, video_url, video_file_name, video_mime_type, video_size_bytes,
          status, payout_status, submitted_at
        ) VALUES
        ($1, 'Emily White', 'emily.w@example.com', '@emilyplays',
         'The Big Bad Wolf is coming for those piggies! 🐺 #HuffAndPuffBig',
         'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800&h=450&fit=crop',
         'emily-wolf.mp4', 'video/mp4', 10485760,
         'IN_REVIEW', 'NOT_APPLICABLE', NOW() - INTERVAL '1 day'),
        ($1, 'Ryan Cooper', 'ryan.c@example.com', '@ryanwins',
         'Just hit a big win on Big Bad Wolf! Check it out!',
         'https://images.unsplash.com/photo-1529368942716-dde9081bf580?w=800&h=450&fit=crop',
         'ryan-bigwin.mp4', 'video/mp4', 14680064,
         'RECEIVED', 'NOT_APPLICABLE', NOW() - INTERVAL '6 hours')
      `, [brief3Id]);
    }

    console.log('[Demo Setup] Submissions created');

    // Get summary
    const summary = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM briefs WHERE status = 'PUBLISHED') as published_briefs,
        (SELECT COUNT(*) FROM submissions) as total_submissions,
        (SELECT COUNT(*) FROM users WHERE user_type = 'admin') as admin_users
    `);

    return res.status(200).json({
      success: true,
      message: 'Demo data created successfully',
      summary: summary.rows[0],
      credentials: {
        admin: 'admin@test.com'
      },
      briefs: [
        { slug: 'pmr-new-years-2025', title: 'PMR New Years 2025' },
        { slug: 'nfl-playoffs-hype', title: 'NFL Playoffs Hype' },
        { slug: 'huff-n-puff-casino', title: 'Huff N Even More Puff' }
      ],
      note: 'Login with admin@test.com to view briefs and add feedback to submissions'
    });

  } catch (error: any) {
    console.error('[Demo Setup] Error:', error);
    return res.status(500).json({
      error: 'Failed to setup demo data',
      message: error.message
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
