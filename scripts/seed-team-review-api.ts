/**
 * API-based seed script for team review data
 * This script creates test briefs and submissions using the API endpoints
 * Works with deployed instances (e.g., Vercel) or local running servers
 *
 * Usage:
 *   npm run seed:team-review-api
 * Or specify a custom URL:
 *   API_URL=https://your-app.vercel.app npm run seed:team-review-api
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function createBrief(briefData: any) {
  const response = await fetch(`${API_URL}/api/briefs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(briefData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create brief: ${response.status} ${error}`);
  }

  return response.json();
}

async function createSubmission(submissionData: any) {
  const response = await fetch(`${API_URL}/api/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submissionData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create submission: ${response.status} ${error}`);
  }

  return response.json();
}

async function seedTeamReviewData() {
  console.log(`🌱 Seeding team review data to ${API_URL}...`);
  console.log('');

  try {
    // Check if server is reachable
    console.log('Checking server health...');
    const healthResponse = await fetch(`${API_URL}/api/health`);
    if (!healthResponse.ok) {
      throw new Error('Server is not responding. Please make sure it is running.');
    }
    console.log('✅ Server is healthy');
    console.log('');

    // Create March Madness brief
    console.log('Creating March Madness 2026 brief...');
    const marchMadnessBrief = await createBrief({
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
      deadline: new Date("2026-03-20T23:59:00Z").toISOString(),
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
    });
    console.log(`✅ Created brief ID: ${marchMadnessBrief.id}`);
    console.log('');

    // Create PMR brief
    console.log('Creating PMR Responsible Gaming Q1 2026 brief...');
    const pmrBrief = await createBrief({
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
      deadline: new Date("2026-03-31T23:59:00Z").toISOString(),
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
    });
    console.log(`✅ Created brief ID: ${pmrBrief.id}`);
    console.log('');

    // Create March Madness submissions
    console.log('Creating March Madness submissions...');

    const submission1 = await createSubmission({
      briefId: marchMadnessBrief.id,
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
    });
    console.log(`  ✅ Submission 1: ${submission1.id}`);

    const submission2 = await createSubmission({
      briefId: marchMadnessBrief.id,
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
    });
    console.log(`  ✅ Submission 2: ${submission2.id}`);
    console.log('');

    // Create PMR submission
    console.log('Creating PMR submission...');

    const submission3 = await createSubmission({
      briefId: pmrBrief.id,
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
    });
    console.log(`  ✅ Submission: ${submission3.id}`);
    console.log('');

    console.log('🎉 Team review data seed completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - March Madness 2026: Brief ID ${marchMadnessBrief.id} (2 submissions)`);
    console.log(`   - PMR Responsible Gaming Q1: Brief ID ${pmrBrief.id} (1 submission)`);
    console.log('');
    console.log('🔗 View briefs at:');
    console.log(`   - ${API_URL}/briefs/${marchMadnessBrief.slug}`);
    console.log(`   - ${API_URL}/briefs/${pmrBrief.slug}`);

  } catch (error: any) {
    console.error('');
    console.error('❌ Error seeding data:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('💡 Tip: Make sure the server is running. Try:');
      console.error('   npm run dev');
      console.error('');
      console.error('Or specify a deployed URL:');
      console.error('   API_URL=https://your-app.vercel.app npm run seed:team-review-api');
    }
    process.exit(1);
  }
}

// Run the seed function
seedTeamReviewData();
