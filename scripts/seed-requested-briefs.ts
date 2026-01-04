import { db, pool } from "../server/db";
import { briefs, submissions, feedback } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seedRequestedBriefs() {
  console.log("🌱 Starting requested briefs seed...");

  try {
    // Insert the three requested briefs
    console.log("Creating requested briefs...");
    const testBriefs = await db.insert(briefs).values([
      {
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
        maxWinners: 5,
        maxSubmissionsPerCreator: 1,
        ownerId: "demo-user-1"
      },
      {
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
        deadline: new Date("2025-01-10T23:59:00Z"),
        status: "PUBLISHED",
        maxWinners: 10,
        maxSubmissionsPerCreator: 2,
        ownerId: "demo-user-1"
      },
      {
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
        rewardAmount: "500",
        rewardCurrency: "USD",
        rewardDescription: "$500 in Casino Credits + Wolf Pack Merch",
        deadline: new Date("2025-01-20T23:59:00Z"),
        status: "PUBLISHED",
        maxWinners: 7,
        maxSubmissionsPerCreator: 3,
        ownerId: "demo-user-1"
      }
    ]).returning();

    console.log(`Created ${testBriefs.length} briefs`);

    // Get brief IDs for submissions
    const pmrBriefId = testBriefs[0].id;
    const nflBriefId = testBriefs[1].id;
    const huffBriefId = testBriefs[2].id;

    // Create submissions
    console.log("Creating submissions...");
    const testSubmissions = await db.insert(submissions).values([
      // PMR New Years - 3 submissions
      {
        briefId: pmrBriefId,
        creatorName: "Sarah Jenkins",
        creatorEmail: "sarah.j@example.com",
        creatorPhone: "+1 555-0101",
        creatorHandle: "@sarahcreates",
        creatorBettingAccount: "sarah_bets",
        message: "Happy New Year from Hard Rock Bet! Here's to winning big in 2025! 🎊 #HardRockNewYear",
        videoUrl: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&h=450&fit=crop",
        videoFileName: "sarah-newyear.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 15728640,
        status: "SELECTED",
        payoutStatus: "PAID",
        payoutAmount: "1000",
        reviewedBy: "demo-user-1",
        selectedAt: new Date()
      },
      {
        briefId: pmrBriefId,
        creatorName: "Mike Chen",
        creatorEmail: "mike.c@example.com",
        creatorHandle: "@mike_vlogs",
        message: "My 2025 betting resolution? Bet smart with Hard Rock! Remember to play responsibly 21+ #HardRockNewYear",
        videoUrl: "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=800&h=450&fit=crop",
        videoFileName: "mike-newyear.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 12582912,
        status: "IN_REVIEW",
        payoutStatus: "NOT_APPLICABLE"
      },
      {
        briefId: pmrBriefId,
        creatorName: "Jessica Alva",
        creatorEmail: "jess.alva@example.com",
        creatorHandle: "@jess_fitness",
        message: "Starting 2025 right with Hard Rock Bet! New year, new wins! 🎯 #HardRockNewYear",
        videoUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&h=450&fit=crop",
        videoFileName: "jess-newyear.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 20971520,
        status: "NOT_SELECTED",
        payoutStatus: "NOT_APPLICABLE",
        reviewedBy: "demo-user-1",
        reviewNotes: "Good content but forgot to mention the responsible gaming message"
      },
      
      // NFL Playoffs - 4 submissions
      {
        briefId: nflBriefId,
        creatorName: "Alex Rivera",
        creatorEmail: "alex.r@example.com",
        creatorHandle: "@alexfitness",
        message: "Who's ready for WILD CARD WEEKEND?! 🏈 My Eagles are going all the way! #FanDuelPlayoffs",
        videoUrl: "https://images.unsplash.com/photo-1566479117168-c91ad0938155?w=800&h=450&fit=crop",
        videoFileName: "alex-playoffs.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 18874368,
        status: "SELECTED",
        payoutStatus: "PENDING",
        payoutAmount: "750",
        reviewedBy: "demo-user-1",
        selectedAt: new Date()
      },
      {
        briefId: nflBriefId,
        creatorName: "Taylor Swift",
        creatorEmail: "taylor.s@example.com",
        creatorHandle: "@tayloractive",
        message: "Game day setup complete! Chiefs Kingdom ready to dominate! Check my picks on FanDuel 🏈 #FanDuelPlayoffs",
        videoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=450&fit=crop",
        videoFileName: "taylor-playoffs.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 16777216,
        status: "IN_REVIEW",
        payoutStatus: "NOT_APPLICABLE"
      },
      {
        briefId: nflBriefId,
        creatorName: "Jordan Lee",
        creatorEmail: "jordan.l@example.com",
        creatorHandle: "@jordanruns",
        message: "Bills Mafia checking in! Wild card predictions locked in on FanDuel! LET'S GO! #FanDuelPlayoffs",
        videoUrl: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&h=450&fit=crop",
        videoFileName: "jordan-playoffs.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 14680064,
        status: "SELECTED",
        payoutStatus: "PENDING",
        payoutAmount: "750",
        reviewedBy: "demo-user-1",
        selectedAt: new Date()
      },
      {
        briefId: nflBriefId,
        creatorName: "Casey Morgan",
        creatorEmail: "casey.m@example.com",
        creatorHandle: "@caseyvibes",
        message: "Cowboys nation stand up! 🤠 Playoffs here we come! All my bets on FanDuel #FanDuelPlayoffs",
        videoUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=450&fit=crop",
        videoFileName: "casey-playoffs.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 19922944,
        status: "RECEIVED",
        payoutStatus: "NOT_APPLICABLE"
      },

      // Huff N Even More Puff - 5 submissions
      {
        briefId: huffBriefId,
        creatorName: "Riley Cooper",
        creatorEmail: "riley.c@example.com",
        creatorHandle: "@rileyoutdoors",
        message: "The Big Bad Wolf can't blow down my wins! 🐺 BetMGM Casino's bonus features are incredible! #HuffAndPuffBig",
        videoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=450&fit=crop",
        videoFileName: "riley-wolf.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 17825792,
        status: "SELECTED",
        payoutStatus: "PAID",
        payoutAmount: "500",
        reviewedBy: "demo-user-1",
        selectedAt: new Date()
      },
      {
        briefId: huffBriefId,
        creatorName: "Sam Williams",
        creatorEmail: "sam.w@example.com",
        creatorHandle: "@samactive",
        message: "Little pigs better watch out! The wolf is coming to BetMGM Casino! 🏠 #HuffAndPuffBig",
        videoUrl: "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&h=450&fit=crop",
        videoFileName: "sam-wolf.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 13631488,
        status: "NOT_SELECTED",
        payoutStatus: "NOT_APPLICABLE",
        reviewedBy: "demo-user-1",
        reviewNotes: "Did not mention bonus features as required"
      },
      {
        briefId: huffBriefId,
        creatorName: "Morgan Davis",
        creatorEmail: "morgan.d@example.com",
        creatorHandle: "@morgansummer",
        message: "Building my house of bricks with BetMGM wins! 🧱 The wolf can't touch these bonuses! #HuffAndPuffBig",
        videoUrl: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&h=450&fit=crop",
        videoFileName: "morgan-wolf.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 15728640,
        status: "IN_REVIEW",
        payoutStatus: "NOT_APPLICABLE"
      },
      {
        briefId: huffBriefId,
        creatorName: "Blake Turner",
        creatorEmail: "blake.t@example.com",
        creatorHandle: "@blakefit",
        message: "Once upon a time, I found the BEST slots at BetMGM Casino! 🐷 Try the Big Bad Wolf! #HuffAndPuffBig",
        videoUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=450&fit=crop",
        videoFileName: "blake-wolf.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 21495808,
        status: "SELECTED",
        payoutStatus: "PENDING",
        payoutAmount: "500",
        reviewedBy: "demo-user-1",
        selectedAt: new Date()
      },
      {
        briefId: huffBriefId,
        creatorName: "Drew Johnson",
        creatorEmail: "drew.j@example.com",
        creatorHandle: "@drewvibes",
        message: "Huffing and puffing my way to big wins! BetMGM's Wolf slots are family-friendly fun! 🏆 #HuffAndPuffBig",
        videoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop",
        videoFileName: "drew-wolf.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 11534336,
        status: "RECEIVED",
        payoutStatus: "NOT_APPLICABLE"
      }
    ]).returning();

    console.log(`Created ${testSubmissions.length} submissions`);

    // Add feedback for some rejected submissions
    await db.insert(feedback).values([
      {
        submissionId: testSubmissions[2].id, // Jessica's PMR submission
        authorId: "demo-user-1",
        authorName: "Demo Admin",
        comment: "Rejection reason: Good content but forgot to mention the responsible gaming message",
        requiresAction: 1
      },
      {
        submissionId: testSubmissions[9].id, // Sam's Huff submission
        authorId: "demo-user-1",
        authorName: "Demo Admin",
        comment: "Rejection reason: Did not mention bonus features as required",
        requiresAction: 1
      }
    ]);

    console.log("✅ Seed completed successfully!");
    console.log(`Created ${testBriefs.length} briefs with ${testSubmissions.length} total submissions`);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed function
seedRequestedBriefs()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));