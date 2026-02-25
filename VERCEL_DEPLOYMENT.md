# Vercel Deployment Guide

## Quick Deploy to Vercel

### Step 1: Login to Vercel

```bash
vercel login
```

This will open your browser for authentication.

### Step 2: Deploy the Application

```bash
vercel --prod
```

**During deployment, you'll be asked:**

1. **Set up and deploy?** → Yes
2. **Which scope?** → Select your account/team
3. **Link to existing project?** → No (or Yes if you already have one)
4. **What's your project's name?** → `bountyboard` (or your preferred name)
5. **In which directory is your code located?** → `./` (press Enter)
6. **Want to override the settings?** → No (vercel.json is already configured)

### Step 3: Set Environment Variables

After initial deployment, you MUST set these environment variables:

```bash
# Set DATABASE_URL (replace with your actual PostgreSQL connection string)
vercel env add DATABASE_URL production

# When prompted, paste your database URL:
# postgresql://user:password@host:5432/database

# Set SESSION_SECRET (use a random secure string)
vercel env add SESSION_SECRET production
# When prompted, enter a long random string (at least 32 characters)

# If using Replit OAuth, also set:
vercel env add REPL_ID production
vercel env add ISSUER_URL production
```

### Step 4: Redeploy with Environment Variables

After setting environment variables, redeploy:

```bash
vercel --prod
```

---

## Important: Database Migration

After deploying, you need to run the database migration:

### Option 1: Run Migration Locally (Recommended)

With your production DATABASE_URL:

```bash
# Export your production database URL
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Run migration
npm run db:push
```

### Option 2: Run SQL Directly

Connect to your production database and run:

```sql
-- From migrations/0000_stale_hannibal_king.sql
CREATE TABLE IF NOT EXISTS "brief_assignments" (
  "id" serial PRIMARY KEY NOT NULL,
  "brief_id" integer NOT NULL,
  "influencer_id" integer NOT NULL,
  "assigned_by" text NOT NULL,
  "assigned_at" timestamp DEFAULT now() NOT NULL,
  "viewed_at" timestamp,
  "status" text DEFAULT 'assigned' NOT NULL,
  CONSTRAINT "brief_assignments_brief_id_influencer_id_unique" UNIQUE("brief_id","influencer_id")
);

-- Add foreign keys
ALTER TABLE "brief_assignments" ADD CONSTRAINT "brief_assignments_brief_id_briefs_id_fk"
  FOREIGN KEY ("brief_id") REFERENCES "briefs"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "brief_assignments" ADD CONSTRAINT "brief_assignments_influencer_id_influencers_id_fk"
  FOREIGN KEY ("influencer_id") REFERENCES "influencers"("id") ON DELETE cascade ON UPDATE no action;

-- Add indexes
CREATE INDEX IF NOT EXISTS "idx_brief_assignments_brief_id" ON "brief_assignments" ("brief_id");
CREATE INDEX IF NOT EXISTS "idx_brief_assignments_influencer_id" ON "brief_assignments" ("influencer_id");
```

---

## Create Test Accounts in Production

After deployment and migration, create test accounts:

```sql
-- Run this in your production database

-- 1. Create Test Admin
INSERT INTO users (id, email, first_name, last_name, user_type, role, is_onboarded, email_verified, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@hardrock.com',
  'Hard Rock',
  'Admin',
  'admin',
  'admin',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 2. Create Test Influencer
INSERT INTO influencers (
  first_name, last_name, email, phone, instagram_handle, instagram_followers,
  status, id_verified, bank_verified, approved_at, created_at, updated_at
)
VALUES (
  'Test', 'Influencer', 'influencer@hardrock.com', '+1 (555) 123-4567',
  'hardrock_test', 10000, 'approved', 1, 1, NOW(), NOW(), NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 3. Link Influencer to User Account
INSERT INTO users (id, email, first_name, last_name, user_type, role, influencer_id, is_onboarded, email_verified, created_at, updated_at)
SELECT
  gen_random_uuid(), i.email, i.first_name, i.last_name,
  'influencer', 'admin', i.id, true, true, NOW(), NOW()
FROM influencers i
WHERE i.email = 'influencer@hardrock.com'
AND NOT EXISTS (SELECT 1 FROM users WHERE users.email = 'influencer@hardrock.com');
```

---

## Verify Deployment

### Check Your Deployment URL

After deployment completes, Vercel will show your URL:
```
https://bountyboard-xxx.vercel.app
```

### Test the Application

1. **Visit your URL** - Should show landing page
2. **Login as admin** - `admin@hardrock.com`
3. **Check admin dashboard** - Should load at `/admin`
4. **Create a brief** - Test the full flow
5. **Login as influencer** - `influencer@hardrock.com`
6. **Check dashboard** - Should load at `/dashboard`

---

## Troubleshooting

### "Internal Server Error" on API calls

**Cause:** Environment variables not set or database not migrated

**Fix:**
1. Check environment variables: `vercel env ls`
2. Add missing variables: `vercel env add <NAME> production`
3. Redeploy: `vercel --prod`
4. Run database migration

### "Cannot connect to database"

**Cause:** DATABASE_URL is incorrect or database is unreachable

**Fix:**
1. Verify DATABASE_URL in Vercel dashboard: Settings → Environment Variables
2. Test connection from your local machine
3. Check database firewall/IP allowlist (allow Vercel IPs or set to 0.0.0.0/0)

### "Authentication required" on all pages

**Cause:** Sessions table doesn't exist or SESSION_SECRET not set

**Fix:**
1. Run database migration to create sessions table
2. Set SESSION_SECRET environment variable
3. Redeploy application

### API routes return 404

**Cause:** Vercel rewrites not working

**Fix:**
1. Verify vercel.json is in root directory
2. Check rewrites configuration is correct
3. Redeploy with: `vercel --prod --force`

### "Brief Assignments" page not loading

**Cause:** brief_assignments table doesn't exist

**Fix:**
1. Run the database migration SQL
2. Verify table exists: `SELECT * FROM brief_assignments LIMIT 1;`

---

## Custom Domain (Optional)

To use your own domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `bountyboard.hardrock.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

---

## Environment Variables Checklist

Make sure these are set in Vercel:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SESSION_SECRET` - Random 32+ character string
- [ ] `REPL_ID` - (Optional, if using Replit OAuth)
- [ ] `ISSUER_URL` - (Optional, if using Replit OAuth)

View all env vars:
```bash
vercel env ls
```

---

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment

To disable auto-deployment:
1. Vercel Dashboard → Your Project → Settings → Git
2. Configure branch settings

---

## Monitor Deployments

View deployment logs:
```bash
vercel logs <deployment-url>
```

Or visit: https://vercel.com/dashboard

---

## Production Checklist

Before going live:

- [ ] Database migration run successfully
- [ ] All environment variables set
- [ ] Test accounts created and working
- [ ] Admin can create briefs
- [ ] Admin can assign influencers
- [ ] Influencers can view assigned briefs
- [ ] Influencers can submit content
- [ ] No public access to briefs (unauthenticated redirects)
- [ ] SSL/HTTPS working
- [ ] Custom domain configured (if applicable)

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel CLI Docs: https://vercel.com/docs/cli
- GitHub Repo: https://github.com/mbark223/bountyboard

Need help? Check the logs: `vercel logs <your-deployment-url>`
