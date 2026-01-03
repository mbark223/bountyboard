import { db, pool } from "../server/db";
import { briefs, submissions, feedback } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seedTestData() {
  console.log("🌱 Starting test data seed...");

  try {
    // Clear existing data (be careful in production!)
    console.log("Clearing existing test data...");
    await db.delete(feedback);
    await db.delete(submissions);
    await db.delete(briefs);

    // Insert test briefs
    console.log("Creating test briefs...");
    const testBriefs = await db.insert(briefs).values([
      {
        slug: "summer-vibes-campaign",
        title: "Summer Vibes Campaign 2025",
        orgName: "Glow Energy",
        businessLine: "Sportsbook",
        state: "Florida",
        overview: "We are looking for high-energy creators to showcase our new Summer Berry flavor. The vibe should be outdoors, fun, and active.",
        requirements: [
          "Must show the can clearly within the first 3 seconds",
          "Mention 'Zero Sugar' and 'Natural Caffeine'",
          "Include the hashtag #GlowSummer in the caption",
          "Filmed outdoors in sunlight"
        ],
        deliverableRatio: "9:16 (Vertical)",
        deliverableLength: "15-30 seconds",
        deliverableFormat: "MP4 / 1080p",
        rewardType: "CASH",
        rewardAmount: "500",
        rewardCurrency: "USD",
        deadline: new Date("2025-07-15T23:59:00Z"),
        status: "PUBLISHED",
        maxWinners: 3,
        maxSubmissionsPerCreator: 3,
        ownerId: "demo-user-1"
      },
      {
        slug: "tech-setup-tour",
        title: "Ultimate Desk Setup Tour",
        orgName: "ErgoLife",
        businessLine: "Casino",
        state: "New Jersey",
        overview: "Show us how you use the ErgoLife Standing Desk in your daily workflow. Focus on ergonomics and productivity.",
        requirements: [
          "Demonstrate the sit-to-stand transition",
          "Talk about how it helps your back pain/posture",
          "Clean, minimal aesthetic preferred"
        ],
        deliverableRatio: "16:9 or 9:16",
        deliverableLength: "45-60 seconds",
        deliverableFormat: "MP4",
        rewardType: "OTHER",
        rewardAmount: "Desk Accessories",
        rewardDescription: "Full set of cable management + monitor arm ($300 value)",
        deadline: new Date("2025-08-01T23:59:00Z"),
        status: "PUBLISHED",
        maxWinners: 5,
        ownerId: "demo-user-1"
      },
      {
        slug: "gaming-night-promo",
        title: "Gaming Night Promo",
        orgName: "BetZone",
        businessLine: "PMR",
        state: "Michigan",
        overview: "Create a hype video for the upcoming championship finals. Authentic reaction style.",
        requirements: [
          "Must be 21+ to submit",
          "Show excitement/reactions",
          "No music due to copyright, voiceover only"
        ],
        deliverableRatio: "9:16",
        deliverableLength: "15s",
        deliverableFormat: "MP4",
        rewardType: "BONUS_BETS",
        rewardAmount: "1000",
        rewardDescription: "in Bonus Bets",
        deadline: new Date("2025-06-30T00:00:00Z"),
        status: "DRAFT",
        ownerId: "demo-user-1"
      }
    ]).returning();

    console.log(`Created ${testBriefs.length} test briefs`);

    // Get the first brief for submissions
    const summerBrief = testBriefs[0];

    // Insert test submissions
    console.log("Creating test submissions...");
    const testSubmissions = await db.insert(submissions).values([
      {
        briefId: summerBrief.id,
        creatorName: "Sarah Jenkins",
        creatorEmail: "sarah.j@example.com",
        creatorHandle: "@sarahcreates",
        creatorBettingAccount: "sarah_bets",
        message: "Love the new flavor! Perfect for beach days ☀️",
        videoUrl: "https://example.com/videos/sarah-summer.mp4",
        videoFileName: "sarah-summer.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 15728640, // 15MB
        status: "SELECTED",
        payoutStatus: "PAID",
        payoutAmount: "500",
        selectedAt: new Date("2025-06-11T10:00:00Z"),
        paidAt: new Date("2025-06-12T15:00:00Z"),
        reviewedBy: "demo-user-1"
      },
      {
        briefId: summerBrief.id,
        creatorName: "Mike Chen",
        creatorEmail: "mike.c@example.com",
        creatorHandle: "@mike_vlogs",
        creatorPhone: "+1234567890",
        message: "Great energy drink for my morning runs!",
        videoUrl: "https://example.com/videos/mike-glow.mp4",
        videoFileName: "mike-glow.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 12582912, // 12MB
        status: "IN_REVIEW",
        payoutStatus: "NOT_APPLICABLE"
      },
      {
        briefId: summerBrief.id,
        creatorName: "Jessica Alva",
        creatorEmail: "jess.alva@example.com",
        creatorHandle: "@jess_fitness",
        message: "Zero sugar and tastes amazing!",
        videoUrl: "https://example.com/videos/jess-summer.mp4",
        videoFileName: "jess-summer.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 20971520, // 20MB
        status: "NOT_SELECTED",
        payoutStatus: "NOT_APPLICABLE",
        reviewNotes: "Good content but didn't show the product clearly in the first 3 seconds",
        reviewedBy: "demo-user-1",
        allowsResubmission: 1
      },
      // Add more submissions to reach 12 total
      {
        briefId: summerBrief.id,
        creatorName: "Alex Rivera",
        creatorEmail: "alex.r@example.com",
        creatorHandle: "@alexfitness",
        videoUrl: "https://example.com/videos/alex-energy.mp4",
        videoFileName: "alex-energy.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 18874368,
        status: "RECEIVED"
      },
      {
        briefId: summerBrief.id,
        creatorName: "Taylor Swift",
        creatorEmail: "taylor.s@example.com",
        creatorHandle: "@tayloractive",
        videoUrl: "https://example.com/videos/taylor-glow.mp4",
        videoFileName: "taylor-glow.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 16777216,
        status: "IN_REVIEW"
      },
      {
        briefId: summerBrief.id,
        creatorName: "Jordan Lee",
        creatorEmail: "jordan.l@example.com",
        creatorHandle: "@jordanruns",
        videoUrl: "https://example.com/videos/jordan-summer.mp4",
        videoFileName: "jordan-summer.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 14680064,
        status: "SELECTED",
        payoutStatus: "PENDING",
        selectedAt: new Date()
      },
      {
        briefId: summerBrief.id,
        creatorName: "Casey Morgan",
        creatorEmail: "casey.m@example.com",
        creatorHandle: "@caseyvibes",
        videoUrl: "https://example.com/videos/casey-beach.mp4",
        videoFileName: "casey-beach.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 19922944,
        status: "RECEIVED"
      },
      {
        briefId: summerBrief.id,
        creatorName: "Riley Cooper",
        creatorEmail: "riley.c@example.com",
        creatorHandle: "@rileyoutdoors",
        videoUrl: "https://example.com/videos/riley-energy.mp4",
        videoFileName: "riley-energy.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 17825792,
        status: "IN_REVIEW"
      },
      {
        briefId: summerBrief.id,
        creatorName: "Sam Williams",
        creatorEmail: "sam.w@example.com",
        creatorHandle: "@samactive",
        videoUrl: "https://example.com/videos/sam-glow.mp4",
        videoFileName: "sam-glow.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 13631488,
        status: "NOT_SELECTED",
        reviewNotes: "Video was too long (45 seconds)",
        allowsResubmission: 1
      },
      {
        briefId: summerBrief.id,
        creatorName: "Morgan Davis",
        creatorEmail: "morgan.d@example.com",
        creatorHandle: "@morgansummer",
        videoUrl: "https://example.com/videos/morgan-beach.mp4",
        videoFileName: "morgan-beach.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 15728640,
        status: "RECEIVED"
      },
      {
        briefId: summerBrief.id,
        creatorName: "Blake Turner",
        creatorEmail: "blake.t@example.com",
        creatorHandle: "@blakefit",
        videoUrl: "https://example.com/videos/blake-energy.mp4",
        videoFileName: "blake-energy.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 21495808,
        status: "SELECTED",
        payoutStatus: "PENDING",
        selectedAt: new Date()
      },
      {
        briefId: summerBrief.id,
        creatorName: "Drew Johnson",
        creatorEmail: "drew.j@example.com",
        creatorHandle: "@drewvibes",
        videoUrl: "https://example.com/videos/drew-summer.mp4",
        videoFileName: "drew-summer.mp4",
        videoMimeType: "video/mp4",
        videoSizeBytes: 11534336,
        status: "RECEIVED"
      }
    ]).returning();

    console.log(`Created ${testSubmissions.length} test submissions`);

    // Add feedback for rejected submission
    const rejectedSubmission = testSubmissions.find(s => s.creatorName === "Jessica Alva");
    if (rejectedSubmission) {
      await db.insert(feedback).values({
        submissionId: rejectedSubmission.id,
        authorId: "demo-user-1",
        authorName: "Demo Admin",
        comment: "Rejection reason: Good content but didn't show the product clearly in the first 3 seconds. Please ensure the can is visible within the first 3 seconds as required.",
        requiresAction: 1
      });
      console.log("Created feedback for rejected submission");
    }

    console.log("✅ Test data seeded successfully!");
    console.log("\nYou can now test:");
    console.log("- Public submission at: /b/summer-vibes-campaign");
    console.log("- Admin view at: /admin/briefs");
    console.log("- 12 submissions for the Summer Vibes Campaign");

  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    throw error;
  } finally {
    await pool?.end();
  }
}

// Run the seed function
seedTestData().catch(console.error);