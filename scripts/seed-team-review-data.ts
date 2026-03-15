import { config } from "dotenv";
import { db, pool } from "../server/db";
import { briefs, submissions } from "@shared/schema";

// Load environment variables before using db
config();

async function seedTeamReviewData() {
  console.log("🌱 Starting team review data seed...");

  try {
    // Insert test briefs for team review
    console.log("Creating test briefs...");
    const testBriefs = await db.insert(briefs).values([
      {
        slug: "march-madness-2026",
        title: "March Madness 2026",
        orgName: "Hard Rock Bet",
        businessLine: "Sportsbook",
        state: "Florida",
        overview: "Get ready for the madness! Create exciting content showcasing your March Madness bracket picks and tournament predictions with Hard Rock Bet.",
        requirements: [
          "Show your bracket on the Hard Rock Bet app",
          "Include your Final Four predictions",
          "Mention Hard Rock Bet by name",
          "High energy tournament vibes required",
          "Include #MarchMadnessHRB hashtag",
          "Must be 21+ to participate"
        ],
        deliverableRatio: "9:16 (Vertical)",
        deliverableLength: "30-60 seconds",
        deliverableFormat: "MP4 / 1080p",
        rewardType: "CASH",
        rewardAmount: "2000",
        rewardCurrency: "USD",
        rewardDescription: "$2000 Cash Prize",
        deadline: new Date("2026-03-20T23:59:00Z"),
        status: "PUBLISHED",
        maxWinners: 3,
        maxSubmissionsPerCreator: 2,
        requester: "Marketing Team",
        responsible: "Sarah Johnson",
        priority: "High",
        campaignTopic: "March Madness Tournament",
        platforms: ["Instagram", "TikTok"],
        creatorsNeeded: 10,
        ownerId: "demo-user-1"
      },
      {
        slug: "pmr-responsible-gaming-q1",
        title: "PMR Responsible Gaming Q1 2026",
        orgName: "Hard Rock Bet",
        businessLine: "PMR",
        state: "Florida",
        overview: "Help us promote responsible gaming practices. Create authentic, educational content that emphasizes the importance of setting limits and playing responsibly.",
        requirements: [
          "Discuss setting deposit limits",
          "Mention self-exclusion tools available",
          "Show the responsible gaming features in the Hard Rock Bet app",
          "Authentic and educational tone required",
          "Include #PlayResponsiblyHRB",
          "Must emphasize 21+ age requirement"
        ],
        deliverableRatio: "16:9 or 9:16",
        deliverableLength: "45-90 seconds",
        deliverableFormat: "MP4 / 1080p minimum",
        rewardType: "CASH",
        rewardAmount: "1500",
        rewardCurrency: "USD",
        rewardDescription: "$1500 Cash",
        deadline: new Date("2026-03-31T23:59:00Z"),
        status: "PUBLISHED",
        maxWinners: 5,
        maxSubmissionsPerCreator: 1,
        requester: "Compliance Team",
        responsible: "Michael Chen",
        priority: "High",
        campaignTopic: "Responsible Gaming Awareness",
        platforms: ["Instagram", "YouTube", "TikTok"],
        creatorsNeeded: 5,
        ownerId: "demo-user-1"
      }
    ]).returning();

    console.log(`✅ Created ${testBriefs.length} briefs`);

    // Get brief IDs for submissions
    const marchMadnessBriefId = testBriefs[0].id;
    const pmrBriefId = testBriefs[1].id;

    // Create submissions
    console.log("Creating test submissions...");
    const testSubmissions = await db.insert(submissions).values([
      // March Madness - 2 submissions
      {
        briefId: marchMadnessBriefId,
        creatorName: "Jason Martinez",
        creatorEmail: "jason.martinez@example.com",
        creatorPhone: "+1 555-0201",
        creatorHandle: "@jasonhoops",
        creatorBettingAccount: "jmartinez_bets",
        message: "Bracket is LOCKED IN! 🏀 My Final Four: Duke, Kansas, UNC, and Gonzaga! Who you got? #MarchMadnessHRB",
        videoUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=450&fit=crop",
        videoFileName: "jason-march-madness.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 22020096,
        status: "IN_REVIEW",
        payoutStatus: "NOT_APPLICABLE"
      },
      {
        briefId: marchMadnessBriefId,
        creatorName: "Emma Rodriguez",
        creatorEmail: "emma.rod@example.com",
        creatorPhone: "+1 555-0202",
        creatorHandle: "@emmaballin",
        creatorBettingAccount: "emma_bets",
        message: "March Madness is HERE! 🏆 Check out my upset picks on the Hard Rock Bet app! Kentucky vs Saint Mary's gonna be WILD! #MarchMadnessHRB",
        videoUrl: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&h=450&fit=crop",
        videoFileName: "emma-march-madness.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 18874368,
        status: "RECEIVED",
        payoutStatus: "NOT_APPLICABLE"
      },

      // PMR Responsible Gaming - 1 submission
      {
        briefId: pmrBriefId,
        creatorName: "David Thompson",
        creatorEmail: "david.t@example.com",
        creatorPhone: "+1 555-0203",
        creatorHandle: "@davidresponsible",
        creatorBettingAccount: "dthompson21",
        message: "Real talk about responsible gaming 🎯 Setting my weekly deposit limits on Hard Rock Bet keeps the fun in the game. Remember - only bet what you can afford to lose! 21+ #PlayResponsiblyHRB",
        videoUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop",
        videoFileName: "david-responsible-gaming.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 25165824,
        status: "RECEIVED",
        payoutStatus: "NOT_APPLICABLE"
      }
    ]).returning();

    console.log(`✅ Created ${testSubmissions.length} submissions`);

    console.log("\n🎉 Team review data seed completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - March Madness 2026: ${testBriefs[0].id} (2 submissions)`);
    console.log(`   - PMR Responsible Gaming Q1: ${testBriefs[1].id} (1 submission)`);
    console.log(`\n🔗 View briefs at:`);
    console.log(`   - /briefs/${testBriefs[0].slug}`);
    console.log(`   - /briefs/${testBriefs[1].slug}`);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed function
seedTeamReviewData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
