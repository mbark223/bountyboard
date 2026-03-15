# Team Review Test Data

This document explains how to populate your application with test data for team review.

## What Gets Created

The seed script creates:

### 1. March Madness 2026 Brief
- **Business Line:** Sportsbook
- **State:** Florida
- **Reward:** $2,000 Cash Prize
- **Max Winners:** 3
- **Submissions:** 2 test submissions
  - Jason Martinez (@jasonhoops) - IN_REVIEW status
  - Emma Rodriguez (@emmaballin) - RECEIVED status

### 2. PMR Responsible Gaming Q1 2026 Brief
- **Business Line:** PMR
- **State:** Florida
- **Reward:** $1,500 Cash
- **Max Winners:** 5
- **Submissions:** 1 test submission
  - David Thompson (@davidresponsible) - RECEIVED status

## How to Seed Data

### Option 1: Deployed Instance (Vercel, etc.)

If your app is already deployed to Vercel or another platform:

```bash
API_URL=https://your-app.vercel.app npm run seed:team-review-api
```

Replace `https://your-app.vercel.app` with your actual deployment URL.

### Option 2: Local Development (with running server)

1. Start your development server:
```bash
npm run dev
```

2. In a new terminal, run the seed script:
```bash
npm run seed:team-review-api
```

### Option 3: Direct Database Seeding (Local only)

If you have a local PostgreSQL database running:

1. Make sure Docker is running and start the database:
```bash
docker-compose up -d
```

2. Run database migrations:
```bash
npm run db:push
```

3. Run the database seed script:
```bash
npm run seed:team-review
```

## Verifying the Data

After seeding, you can verify the data was created:

### Via Web Interface
1. Navigate to `/admin` (admin dashboard)
2. You should see the two new briefs:
   - March Madness 2026 (2 submissions)
   - PMR Responsible Gaming Q1 2026 (1 submission)

### Via API
```bash
# Get all briefs
curl http://localhost:3000/api/admin/briefs

# Get March Madness brief
curl http://localhost:3000/api/briefs/march-madness-2026

# Get PMR brief
curl http://localhost:3000/api/briefs/pmr-responsible-gaming-q1
```

## Cleaning Up Test Data

To remove the test data, you can either:
1. Delete the briefs manually through the admin interface
2. Reset your database and re-run migrations

## Troubleshooting

### "Server is not responding"
- Make sure your server is running (`npm run dev`)
- Or verify your deployment URL is correct

### "DATABASE_URL not set"
- This only affects the direct database seed script
- Use the API-based approach instead: `npm run seed:team-review-api`

### "Failed to create brief: 401"
- Your deployment may require authentication
- Check your auth configuration

## Next Steps

After seeding the data:
1. Review the briefs in the admin dashboard
2. Test the submission review workflow
3. Share the brief URLs with your team for feedback
