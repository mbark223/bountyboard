// JavaScript version of admin briefs endpoint
import { Pool } from 'pg';

// Mock data for demo mode - same as briefs-by-slug.js
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
    submissionCount: 3,
    reward: {
      type: "BONUS_BETS",
      amount: "1000",
      currency: "USD",
      description: "in Free Bets"
    },
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
    submissionCount: 5,
    reward: {
      type: "CASH",
      amount: "750",
      currency: "USD",
      description: null
    },
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
    submissionCount: 2,
    reward: {
      type: "OTHER",
      amount: "Casino Credits",
      currency: "USD",
      description: "$500 in Casino Credits + Wolf Pack Merch"
    },
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
    submissionCount: 0,
    reward: {
      type: "CASH",
      amount: "500",
      currency: "USD",
      description: null
    },
    organization: {
      name: "Hard Rock Bet",
      slug: null,
      logoUrl: null,
      website: null,
      description: null
    }
  }
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let pool;
  
  try {
    if (!process.env.DATABASE_URL) {
      // Use mock data in demo mode
      console.log('[Demo Admin API] Using mock data - DATABASE_URL not configured');
      console.log(`[Demo Admin API] Returning ${MOCK_BRIEFS.length} briefs for admin`);
      return res.status(200).json(MOCK_BRIEFS);
    }
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Get all briefs with organization info and submission counts
    const briefsResult = await pool.query(`
      SELECT 
        b.*,
        u.org_name as user_org_name,
        u.org_slug,
        u.org_logo_url,
        u.org_website,
        u.org_description,
        COUNT(DISTINCT s.id) as submission_count
      FROM briefs b
      LEFT JOIN users u ON b.owner_id = u.id
      LEFT JOIN submissions s ON b.id = s.brief_id
      GROUP BY b.id, u.id
      ORDER BY b.created_at DESC
    `);
    
    // Transform the results to match expected format
    const briefs = briefsResult.rows.map(row => ({
      id: row.id,
      slug: row.slug,
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
      submissionCount: parseInt(row.submission_count) || 0,
      reward: {
        type: row.reward_type,
        amount: row.reward_amount,
        currency: row.reward_currency || 'USD',
        description: row.reward_description
      },
      organization: {
        name: row.user_org_name || row.org_name,
        slug: row.org_slug,
        logoUrl: row.org_logo_url,
        website: row.org_website,
        description: row.org_description,
      }
    }));
    
    console.log(`Returning ${briefs.length} briefs for admin`);
    res.status(200).json(briefs);
    
  } catch (error) {
    console.error('Error fetching admin briefs:', error);
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