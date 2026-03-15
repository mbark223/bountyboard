#!/bin/bash

API_URL="https://bountyboard-kappa.vercel.app"

echo "🌱 Seeding team review data to $API_URL..."
echo ""

# Create March Madness brief
echo "Creating March Madness 2026 brief..."
MARCH_MADNESS=$(curl -s -X POST "$API_URL/api/briefs" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "march-madness-2026",
    "title": "March Madness 2026",
    "orgName": "Hard Rock Bet",
    "businessLine": "Sportsbook",
    "state": "Florida",
    "overview": "Get ready for the madness! Create exciting content showcasing your March Madness bracket picks and tournament predictions with Hard Rock Bet.",
    "requirements": [
      "Show your bracket on the Hard Rock Bet app",
      "Include your Final Four predictions",
      "Mention Hard Rock Bet by name",
      "High energy tournament vibes required",
      "Include #MarchMadnessHRB hashtag",
      "Must be 21+ to participate"
    ],
    "deliverableRatio": "9:16 (Vertical)",
    "deliverableLength": "30-60 seconds",
    "deliverableFormat": "MP4 / 1080p",
    "rewardType": "CASH",
    "rewardAmount": "2000",
    "rewardCurrency": "USD",
    "rewardDescription": "$2000 Cash Prize",
    "deadline": "2026-03-20T23:59:00Z",
    "status": "PUBLISHED",
    "maxWinners": 3,
    "maxSubmissionsPerCreator": 2,
    "requester": "Marketing Team",
    "responsible": "Sarah Johnson",
    "priority": "High",
    "campaignTopic": "March Madness Tournament",
    "platforms": ["Instagram", "TikTok"],
    "creatorsNeeded": 10,
    "ownerId": "demo-user-1"
  }')

MARCH_MADNESS_ID=$(echo $MARCH_MADNESS | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
echo "✅ Created March Madness brief (ID: $MARCH_MADNESS_ID)"
echo ""

# Create PMR brief
echo "Creating PMR Responsible Gaming Q1 2026 brief..."
PMR_BRIEF=$(curl -s -X POST "$API_URL/api/briefs" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "pmr-responsible-gaming-q1",
    "title": "PMR Responsible Gaming Q1 2026",
    "orgName": "Hard Rock Bet",
    "businessLine": "PMR",
    "state": "Florida",
    "overview": "Help us promote responsible gaming practices. Create authentic, educational content that emphasizes the importance of setting limits and playing responsibly.",
    "requirements": [
      "Discuss setting deposit limits",
      "Mention self-exclusion tools available",
      "Show the responsible gaming features in the Hard Rock Bet app",
      "Authentic and educational tone required",
      "Include #PlayResponsiblyHRB",
      "Must emphasize 21+ age requirement"
    ],
    "deliverableRatio": "16:9 or 9:16",
    "deliverableLength": "45-90 seconds",
    "deliverableFormat": "MP4 / 1080p minimum",
    "rewardType": "CASH",
    "rewardAmount": "1500",
    "rewardCurrency": "USD",
    "rewardDescription": "$1500 Cash",
    "deadline": "2026-03-31T23:59:00Z",
    "status": "PUBLISHED",
    "maxWinners": 5,
    "maxSubmissionsPerCreator": 1,
    "requester": "Compliance Team",
    "responsible": "Michael Chen",
    "priority": "High",
    "campaignTopic": "Responsible Gaming Awareness",
    "platforms": ["Instagram", "YouTube", "TikTok"],
    "creatorsNeeded": 5,
    "ownerId": "demo-user-1"
  }')

PMR_BRIEF_ID=$(echo $PMR_BRIEF | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
echo "✅ Created PMR brief (ID: $PMR_BRIEF_ID)"
echo ""

# Create March Madness submissions
echo "Creating March Madness submissions..."

curl -s -X POST "$API_URL/api/submissions" \
  -H "Content-Type: application/json" \
  -d "{
    \"briefId\": $MARCH_MADNESS_ID,
    \"creatorName\": \"Jason Martinez\",
    \"creatorEmail\": \"jason.martinez@example.com\",
    \"creatorPhone\": \"+1 555-0201\",
    \"creatorHandle\": \"@jasonhoops\",
    \"creatorBettingAccount\": \"jmartinez_bets\",
    \"message\": \"Bracket is LOCKED IN! 🏀 My Final Four: Duke, Kansas, UNC, and Gonzaga! Who you got? #MarchMadnessHRB\",
    \"videoUrl\": \"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=450&fit=crop\",
    \"videoFileName\": \"jason-march-madness.mp4\",
    \"videoMimeType\": \"video/mp4\",
    \"videoSizeBytes\": 22020096,
    \"status\": \"IN_REVIEW\",
    \"payoutStatus\": \"NOT_APPLICABLE\"
  }" > /dev/null

echo "  ✅ Submission 1: Jason Martinez"

curl -s -X POST "$API_URL/api/submissions" \
  -H "Content-Type: application/json" \
  -d "{
    \"briefId\": $MARCH_MADNESS_ID,
    \"creatorName\": \"Emma Rodriguez\",
    \"creatorEmail\": \"emma.rod@example.com\",
    \"creatorPhone\": \"+1 555-0202\",
    \"creatorHandle\": \"@emmaballin\",
    \"creatorBettingAccount\": \"emma_bets\",
    \"message\": \"March Madness is HERE! 🏆 Check out my upset picks on the Hard Rock Bet app! Kentucky vs Saint Mary's gonna be WILD! #MarchMadnessHRB\",
    \"videoUrl\": \"https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&h=450&fit=crop\",
    \"videoFileName\": \"emma-march-madness.mp4\",
    \"videoMimeType\": \"video/mp4\",
    \"videoSizeBytes\": 18874368,
    \"status\": \"RECEIVED\",
    \"payoutStatus\": \"NOT_APPLICABLE\"
  }" > /dev/null

echo "  ✅ Submission 2: Emma Rodriguez"
echo ""

# Create PMR submission
echo "Creating PMR submission..."

curl -s -X POST "$API_URL/api/submissions" \
  -H "Content-Type: application/json" \
  -d "{
    \"briefId\": $PMR_BRIEF_ID,
    \"creatorName\": \"David Thompson\",
    \"creatorEmail\": \"david.t@example.com\",
    \"creatorPhone\": \"+1 555-0203\",
    \"creatorHandle\": \"@davidresponsible\",
    \"creatorBettingAccount\": \"dthompson21\",
    \"message\": \"Real talk about responsible gaming 🎯 Setting my weekly deposit limits on Hard Rock Bet keeps the fun in the game. Remember - only bet what you can afford to lose! 21+ #PlayResponsiblyHRB\",
    \"videoUrl\": \"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop\",
    \"videoFileName\": \"david-responsible-gaming.mp4\",
    \"videoMimeType\": \"video/mp4\",
    \"videoSizeBytes\": 25165824,
    \"status\": \"RECEIVED\",
    \"payoutStatus\": \"NOT_APPLICABLE\"
  }" > /dev/null

echo "  ✅ Submission: David Thompson"
echo ""

echo "🎉 Team review data seed completed!"
echo ""
echo "📊 Summary:"
echo "   - March Madness 2026: Brief ID $MARCH_MADNESS_ID (2 submissions)"
echo "   - PMR Responsible Gaming Q1: Brief ID $PMR_BRIEF_ID (1 submission)"
echo ""
echo "🔗 View briefs at:"
echo "   - $API_URL/briefs/march-madness-2026"
echo "   - $API_URL/briefs/pmr-responsible-gaming-q1"
