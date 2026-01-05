import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock data for demo mode
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
    deadline: new Date("2025-01-05T23:59:00Z").toISOString(),
    status: "PUBLISHED",
    password: null,
    maxWinners: 5,
    maxSubmissionsPerCreator: 1,
    ownerId: "demo-user-1",
    createdAt: new Date("2024-12-20T10:00:00Z").toISOString(),
    updatedAt: new Date().toISOString(),
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
    deadline: new Date("2025-01-10T23:59:00Z").toISOString(),
    status: "PUBLISHED",
    password: null,
    maxWinners: 10,
    maxSubmissionsPerCreator: 2,
    ownerId: "demo-user-1",
    createdAt: new Date("2024-12-28T14:00:00Z").toISOString(),
    updatedAt: new Date().toISOString(),
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
    deadline: new Date("2025-01-15T23:59:00Z").toISOString(),
    status: "PUBLISHED",
    password: null,
    maxWinners: 3,
    maxSubmissionsPerCreator: 1,
    ownerId: "demo-user-1",
    createdAt: new Date("2024-12-25T09:00:00Z").toISOString(),
    updatedAt: new Date().toISOString(),
    organization: {
      name: "BetMGM",
      slug: null,
      logoUrl: null,
      website: null,
      description: null
    }
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  
  if (req.method === 'GET') {
    try {
      console.log('[Demo API] Fetching brief with slug:', slug);
      
      if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ error: "Slug parameter is required" });
      }
      
      // Find brief by slug
      let brief = MOCK_BRIEFS.find(b => b.slug === slug);
      
      // If not found and slug looks like "brief-123", try to find by ID
      if (!brief && slug.startsWith('brief-')) {
        const id = parseInt(slug.replace('brief-', ''));
        if (!isNaN(id)) {
          brief = MOCK_BRIEFS.find(b => b.id === id);
        }
      }
      
      if (!brief) {
        console.log('[Demo API] Brief not found for slug:', slug);
        return res.status(404).json({ error: "Brief not found", slug });
      }
      
      console.log('[Demo API] Brief found:', { id: brief.id, title: brief.title });
      res.status(200).json(brief);
    } catch (error: any) {
      console.error("[Demo API] Error:", error);
      res.status(500).json({ error: "Failed to fetch brief", details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}