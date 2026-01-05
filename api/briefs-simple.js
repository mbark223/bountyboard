// Simple JavaScript version of briefs endpoint
import { Pool } from 'pg';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    // For POST requests, return a simple error in demo mode
    return res.status(400).json({ error: 'Creating briefs is not available in demo mode' });
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  let pool;
  
  try {
    if (!process.env.DATABASE_URL) {
      // Use mock data in demo mode - return only published briefs
      console.log('[Demo API] Using mock data - DATABASE_URL not configured');
      const MOCK_BRIEFS = [
        {
          id: 1,
          slug: "pmr-new-years-2025",
          title: "PMR New Years 2025",
          orgName: "Hard Rock Bet",
          businessLine: "PMR",
          state: "Florida",
          overview: "Celebrate the New Year with Hard Rock Bet! Create engaging content showcasing your New Year's betting traditions and resolutions.",
          requirements: [
            "Mention Hard Rock Bet app",
            "Show responsible gaming message",
            "Include #HardRockNewYear",
            "Must be 21+ to participate"
          ],
          deliverableRatio: "9:16 (Vertical)",
          deliverableLength: "15-30 seconds",
          deliverableFormat: "MP4 / 1080p",
          rewardType: "BONUS_BETS",
          rewardAmount: "1000",
          rewardCurrency: "USD",
          rewardDescription: "in Free Bets",
          deadline: new Date("2025-01-05T23:59:00Z"),
          status: "PUBLISHED",
          password: null,
          maxWinners: 5,
          maxSubmissionsPerCreator: 1,
          ownerId: "demo-user-1",
          createdAt: new Date("2024-12-20T10:00:00Z"),
          updatedAt: new Date(),
          organization: {
            name: "Hard Rock Bet",
            slug: null,
            logoUrl: null,
            website: null,
            description: null
          }
        },
        {
          id: 2,
          slug: "nfl-playoffs-hype",
          title: "NFL Playoffs Hype",
          orgName: "FanDuel",
          businessLine: "Sportsbook",
          state: "New Jersey",
          overview: "Get fans pumped for the NFL playoffs! Show your game day setup and predictions for the wild card weekend.",
          requirements: [
            "Wear your team colors",
            "Show FanDuel app on screen",
            "Share your playoff predictions",
            "High energy required",
            "Include #FanDuelPlayoffs"
          ],
          deliverableRatio: "16:9 or 9:16",
          deliverableLength: "30-60 seconds",
          deliverableFormat: "MP4 / 4K preferred",
          rewardType: "CASH",
          rewardAmount: "750",
          rewardCurrency: "USD",
          rewardDescription: null,
          deadline: new Date("2025-01-10T23:59:00Z"),
          status: "PUBLISHED",
          password: null,
          maxWinners: 10,
          maxSubmissionsPerCreator: 2,
          ownerId: "demo-user-1",
          createdAt: new Date("2024-12-28T14:00:00Z"),
          updatedAt: new Date(),
          organization: {
            name: "FanDuel",
            slug: null,
            logoUrl: null,
            website: null,
            description: null
          }
        },
        {
          id: 3,
          slug: "huff-n-even-more-puff",
          title: "Huff N Even More Puff",
          orgName: "BetMGM",
          businessLine: "Casino",
          state: "Michigan",
          overview: "Showcase the excitement of our Big Bad Wolf slot game! Create fairy tale themed content that highlights the thrill of the chase.",
          requirements: [
            "Reference the Three Little Pigs story",
            "Show BetMGM Casino app",
            "Mention the bonus features",
            "Family-friendly content only",
            "Use #HuffAndPuffBig"
          ],
          deliverableRatio: "1:1 (Square)",
          deliverableLength: "15 seconds",
          deliverableFormat: "MP4 / 1080p",
          rewardType: "OTHER",
          rewardAmount: "Casino Credits",
          rewardDescription: "$500 in Casino Credits + Wolf Pack Merch",
          deadline: new Date("2025-01-15T23:59:00Z"),
          status: "PUBLISHED",
          password: null,
          maxWinners: 3,
          maxSubmissionsPerCreator: 1,
          ownerId: "demo-user-1",
          createdAt: new Date("2024-12-25T09:00:00Z"),
          updatedAt: new Date(),
          organization: {
            name: "BetMGM",
            slug: null,
            logoUrl: null,
            website: null,
            description: null
          }
        },
        {
          id: 4,
          slug: "hard-rock-casino-legends",
          title: "Hard Rock Casino Legends",
          orgName: "Hard Rock Bet",
          businessLine: "Casino",
          state: "Florida",
          overview: "Showcase the legendary casino experience at Hard Rock! Create content featuring your favorite casino games and the excitement of winning big.",
          requirements: [
            "Feature Hard Rock Casino app",
            "Show responsible gaming message",
            "Highlight casino atmosphere",
            "Include #HardRockLegends",
            "Must be 21+ to participate"
          ],
          deliverableRatio: "9:16 or 1:1",
          deliverableLength: "15-30 seconds",
          deliverableFormat: "MP4 / 1080p",
          rewardType: "CASH",
          rewardAmount: "500",
          rewardCurrency: "USD",
          rewardDescription: null,
          deadline: new Date("2025-01-20T23:59:00Z"),
          status: "PUBLISHED",
          password: null,
          maxWinners: 5,
          maxSubmissionsPerCreator: 1,
          ownerId: "demo-user-1",
          createdAt: new Date("2024-12-30T10:00:00Z"),
          updatedAt: new Date(),
          organization: {
            name: "Hard Rock Bet",
            slug: null,
            logoUrl: null,
            website: null,
            description: null
          }
        }
      ];
      
      console.log(`[Demo API] Returning ${MOCK_BRIEFS.length} published briefs`);
      return res.status(200).json(MOCK_BRIEFS);
    }
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const result = await pool.query(`
      SELECT 
        b.*,
        u.org_name as user_org_name,
        u.org_slug,
        u.org_logo_url,
        u.org_website,
        u.org_description
      FROM briefs b
      LEFT JOIN users u ON b.owner_id = u.id
      WHERE b.status = 'PUBLISHED'
      ORDER BY b.created_at DESC
    `);
    
    // Transform snake_case to camelCase
    const briefs = result.rows.map(row => ({
      id: row.id,
      slug: row.slug || `brief-${row.id}`, // Fallback to ID-based slug if null
      title: row.title,
      orgName: row.org_name,
      businessLine: row.business_line,
      state: row.state,
      overview: row.overview,
      requirements: row.requirements,
      deliverableRatio: row.deliverable_ratio,
      deliverableLength: row.deliverable_length,
      deliverableFormat: row.deliverable_format,
      rewardType: row.reward_type,
      rewardAmount: row.reward_amount,
      rewardCurrency: row.reward_currency,
      rewardDescription: row.reward_description,
      deadline: row.deadline,
      status: row.status,
      password: row.password,
      maxWinners: row.max_winners,
      maxSubmissionsPerCreator: row.max_submissions_per_creator,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      organization: {
        name: row.user_org_name || row.org_name,
        slug: row.org_slug,
        logoUrl: row.org_logo_url,
        website: row.org_website,
        description: row.org_description,
      }
    }));
    
    console.log(`Returning ${briefs.length} published briefs`);
    console.log('Brief slugs:', briefs.map(b => ({ id: b.id, slug: b.slug, title: b.title })));
    res.status(200).json(briefs);
    
  } catch (error) {
    console.error('Error fetching briefs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch briefs',
      message: error.message,
      code: error.code
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}