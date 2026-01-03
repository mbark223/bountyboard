import { db, pool } from "../server/db";
import { briefs, submissions, feedback, influencers } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seedTestData() {
  console.log("🌱 Starting test data seed...");

  try {
    // Clear existing data (be careful in production!)
    console.log("Clearing existing test data...");
    await db.delete(feedback);
    await db.delete(submissions);
    await db.delete(briefs);
    await db.delete(influencers);

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
        videoUrl: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&h=450&fit=crop",
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
        videoUrl: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&h=450&fit=crop",
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
        videoUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&h=450&fit=crop",
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
        videoUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop",
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
        videoUrl: "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800&h=450&fit=crop",
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
        videoUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=450&fit=crop",
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
        videoUrl: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&h=450&fit=crop",
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
        videoUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=450&fit=crop",
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
        videoUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=450&fit=crop",
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
        videoUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=450&fit=crop",
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
        videoUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop",
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
        videoUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=450&fit=crop",
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

    // Create approved influencers for demo
    console.log("Creating approved influencers...");
    const testInfluencers = await db.insert(influencers).values([
      {
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "sarah.j@example.com",
        phone: "+1 555-0101",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        instagramHandle: "@sarahcreates",
        instagramFollowers: 45000,
        instagramVerified: 1,
        tiktokHandle: "@sarahcreates",
        bankAccountHolderName: "Sarah Jenkins",
        bankRoutingNumber: "123456789",
        bankAccountNumber: "000123456789",
        bankAccountType: "checking",
        taxIdNumber: "XXX-XX-1234",
        status: "approved",
        idVerified: 1,
        bankVerified: 1,
        approvedAt: new Date("2025-05-01T10:00:00Z"),
        lastActiveAt: new Date()
      },
      {
        firstName: "Mike",
        lastName: "Chen",
        email: "mike.c@example.com",
        phone: "+1 555-0102",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        instagramHandle: "@mike_vlogs",
        instagramFollowers: 28000,
        instagramVerified: 0,
        status: "approved",
        idVerified: 1,
        bankVerified: 1,
        approvedAt: new Date("2025-05-15T14:00:00Z"),
        lastActiveAt: new Date()
      },
      {
        firstName: "Jessica",
        lastName: "Alva",
        email: "jess.alva@example.com",
        phone: "+1 555-0103",
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        instagramHandle: "@jess_fitness",
        instagramFollowers: 72000,
        instagramVerified: 1,
        youtubeChannel: "JessFitness",
        status: "approved",
        idVerified: 1,
        bankVerified: 1,
        approvedAt: new Date("2025-04-20T09:00:00Z"),
        lastActiveAt: new Date()
      },
      {
        firstName: "Emma",
        lastName: "Thompson",
        email: "emma.t@example.com",
        phone: "+1 555-0104",
        instagramHandle: "@emmacreates",
        instagramFollowers: 15000,
        status: "pending",
        idVerified: 0,
        bankVerified: 0,
        appliedAt: new Date()
      },
      {
        firstName: "David",
        lastName: "Garcia",
        email: "david.g@example.com", 
        phone: "+1 555-0105",
        instagramHandle: "@davidlifestyle",
        instagramFollowers: 5000,
        status: "rejected",
        idVerified: 0,
        bankVerified: 0,
        rejectionReason: "Instagram follower count below minimum requirement",
        rejectedAt: new Date("2025-05-10T11:00:00Z")
      }
    ]).returning();

    console.log(`Created ${testInfluencers.length} test influencers`);

    console.log("✅ Test data seeded successfully!");
    console.log("\nYou can now test:");
    console.log("- Public submission at: /b/summer-vibes-campaign");
    console.log("- Admin view at: /admin/briefs");
    console.log("- Influencer portal at: /portal");
    console.log("\nTest Accounts:");
    console.log("- Approved influencers: sarah.j@example.com, mike.c@example.com, jess.alva@example.com");
    console.log("- Pending influencer: emma.t@example.com");
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