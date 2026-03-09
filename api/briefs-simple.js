// Simple JavaScript version of briefs endpoint
import { Pool } from 'pg';
import { getUser } from './_lib/auth';
import { storage } from './_lib/storage';

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

  // Check authentication
  const user = await getUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // For admins: return briefs they own
    if (user.userType === 'admin' || user.role === 'admin') {
      const briefs = await storage.getBriefsByOwnerId(user.id);
      console.log(`[Auth] Admin ${user.email} - returning ${briefs.length} owned briefs`);
      return res.status(200).json(briefs);
    }

    // For influencers: return only assigned briefs
    if (user.userType === 'influencer') {
      const influencer = await storage.getInfluencerByEmail(user.email);

      if (!influencer) {
        console.log(`[Auth] Influencer ${user.email} - no influencer record found`);
        return res.status(403).json({ error: 'Influencer profile not found' });
      }

      if (influencer.status !== 'approved') {
        console.log(`[Auth] Influencer ${user.email} - status: ${influencer.status}`);
        return res.status(403).json({
          error: 'Account pending approval',
          status: influencer.status
        });
      }

      const briefs = await storage.getAssignedBriefs(influencer.id);
      console.log(`[Auth] Influencer ${user.email} - returning ${briefs.length} assigned briefs`);
      return res.status(200).json(briefs);
    }

    // Other user types not allowed
    console.log(`[Auth] User ${user.email} - unauthorized userType: ${user.userType}`);
    return res.status(403).json({ error: 'Access denied' });

  } catch (error) {
    console.error('Error fetching briefs:', error);
    res.status(500).json({
      error: 'Failed to fetch briefs',
      message: error.message
    });
  }
}

// Legacy mock data code (kept for reference, but no longer used)
function getLegacyMockBriefs() {
  return [
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
}