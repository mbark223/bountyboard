# Vercel Deployment Configuration

This project is now configured for Vercel deployment. The configuration converts the Express.js backend into Vercel serverless functions while maintaining the same API structure.

## Configuration Overview

1. **vercel.json** - Configures the build process and routing
2. **api/** directory - Contains serverless functions that handle API requests
3. **dist/public/** - Static frontend files served by Vercel

## Environment Variables

Before deploying, ensure you set the following environment variables in your Vercel project:

- `DATABASE_URL` - PostgreSQL connection string

## Deployment Steps

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the required environment variables
4. Deploy

## API Routes

All API routes maintain their original paths:
- `/api/briefs` - GET all briefs, POST new brief
- `/api/briefs/[slug]` - GET brief by slug
- `/api/briefs/[id]/submissions` - GET submissions for a brief
- `/api/submissions` - POST new submission
- `/api/submissions/[id]/status` - PATCH submission status
- `/api/submissions/[id]/payout` - PATCH payout status
- `/api/fetch-brand` - POST to fetch brand metadata

## Notes

- The frontend is served statically from `dist/public/`
- API routes are handled by serverless functions in the `api/` directory
- Database connections are managed per-request in the serverless environment