# Quick Test Setup Guide

## Setup Test Accounts

You have **3 options** to create test accounts:

---

## Option 1: Run SQL Script (Easiest) ✨

### If using Neon, Supabase, or hosted PostgreSQL:

1. **Open your database console:**
   - Neon: Go to your project → SQL Editor
   - Supabase: Go to SQL Editor tab
   - pgAdmin: Open Query Tool

2. **Copy and paste the SQL from:**
   ```
   scripts/create-test-accounts.sql
   ```

3. **Run the script** - it will create:
   - ✅ Admin account: `admin@test.com`
   - ✅ Influencer record: `influencer@test.com` (approved)
   - ✅ Influencer user account linked to the record

4. **Done!** You can now test with these credentials.

---

## Option 2: Use the Application UI (Most Realistic)

### Create Admin Manually:

Since you need database access to create the first admin, use Option 1 or 3 for admin.

### Create Influencer via Registration Flow:

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Open browser:** `http://localhost:5000/apply`

3. **Fill out registration form:**
   - First Name: `Demo`
   - Last Name: `Influencer`
   - Email: `demo@influencer.com`
   - Instagram: `@demoinfluencer`

4. **Submit application** (creates pending influencer)

5. **Login as admin** at `http://localhost:5000/login`

6. **Go to:** `/admin/influencers`

7. **Approve the influencer** - this auto-creates their user account

8. **Done!** The influencer can now login.

---

## Option 3: Local PostgreSQL Setup

If you want to run PostgreSQL locally:

### Install PostgreSQL:

**Mac (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from: https://www.postgresql.org/download/windows/

### Create Database:

```bash
# Create database
createdb bountyboard

# Or using psql
psql postgres
CREATE DATABASE bountyboard;
\q
```

### Run Migration:

```bash
npm run db:push
```

### Run Test Account Script:

```bash
npx tsx scripts/create-test-accounts.ts
```

---

## Verify Accounts Were Created

Run this query in your database:

```sql
-- Check all test accounts
SELECT
  email,
  first_name,
  last_name,
  user_type,
  is_onboarded
FROM users
WHERE email IN ('admin@test.com', 'influencer@test.com');
```

You should see:
```
email                  | first_name | last_name  | user_type   | is_onboarded
-----------------------|------------|------------|-------------|-------------
admin@test.com         | Test       | Admin      | admin       | true
influencer@test.com    | Test       | Influencer | influencer  | true
```

---

## Test the Application

### 1. Start the Dev Server:

```bash
npm run dev
```

App runs at: `http://localhost:5000`

### 2. Test Admin Flow:

1. Go to: `http://localhost:5000/login`
2. Login with: `admin@test.com`
3. Should redirect to: `/admin` (admin dashboard)
4. Try accessing:
   - `/admin/briefs` - View briefs
   - `/admin/influencers` - Manage influencers
   - `/admin/briefs/new` - Create a brief

### 3. Test Influencer Flow:

1. **Logout** from admin
2. Login with: `influencer@test.com`
3. Should redirect to: `/dashboard` (influencer dashboard)
4. Should see: "Welcome, Test!" with empty state (no assigned briefs yet)

### 4. Test Assignment Flow:

1. **As Admin:**
   - Create a brief at `/admin/briefs/new`
   - Fill out form and submit
   - On brief detail page, click **"Manage Assignments"**
   - You should see "Test Influencer" in the list
   - Click checkbox or "Assign" button

2. **As Influencer:**
   - Refresh dashboard
   - You should now see the assigned brief!
   - Click **"Submit Video"** to test submission

---

## Login Methods

Depending on your authentication setup:

### Magic Link (Email-based):
- Enter email → Check your inbox for magic link
- Click link to login

### Replit OAuth:
- Click "Login with Replit"
- Authorize the application
- Make sure the email matches test account email

### Custom OAuth:
- Follow your configured OAuth flow
- Email must match test account

---

## Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` in `.env` file
- Verify database server is running
- Test connection with: `psql $DATABASE_URL`

### "Authentication required" on all pages
- Sessions table might be missing
- Run: `npm run db:push` to create all tables
- Check if cookies are being set (browser dev tools)

### Admin can't access /admin routes
- Verify user has `user_type='admin'` or `role='admin'`
- Check browser console for errors
- Clear cookies and login again

### Influencer can't see assigned briefs
- Verify influencer status is 'approved' in database
- Check `brief_assignments` table has the assignment
- Verify influencer has linked user account

### "Influencer with this email already exists"
- Email already in use
- Use different email or delete existing:
  ```sql
  DELETE FROM users WHERE email = 'influencer@test.com';
  DELETE FROM influencers WHERE email = 'influencer@test.com';
  ```

---

## Quick Database Checks

### See all users:
```sql
SELECT email, user_type, first_name, last_name FROM users;
```

### See all influencers:
```sql
SELECT email, first_name, last_name, status FROM influencers;
```

### See all brief assignments:
```sql
SELECT
  b.title,
  i.first_name || ' ' || i.last_name as influencer,
  ba.assigned_at
FROM brief_assignments ba
JOIN briefs b ON ba.brief_id = b.id
JOIN influencers i ON ba.influencer_id = i.id;
```

### Delete test accounts (cleanup):
```sql
-- Delete test users
DELETE FROM users WHERE email IN ('admin@test.com', 'influencer@test.com');

-- Delete test influencer
DELETE FROM influencers WHERE email = 'influencer@test.com';
```

---

## Next Steps

Once accounts are set up:

1. ✅ Follow **TESTING_GUIDE.md** for comprehensive testing
2. ✅ Test all 3 main user flows
3. ✅ Verify security and access control
4. ✅ Test API endpoints with Postman

Happy testing! 🎉
