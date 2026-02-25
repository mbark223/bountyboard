# Test Login - Quick Development Access

## ⚠️ Development Only Feature

This test login system is designed for **quick testing and development**. It bypasses normal OAuth/Magic Link flows and creates sessions directly.

**⚠️ IMPORTANT:** This should be disabled or removed in production environments.

---

## How to Use Test Login

### 1. Start the Application

```bash
npm run dev
```

### 2. Go to Login Page

Open your browser to: `http://localhost:5000/login`

### 3. Enter Test Email

Use one of these test accounts:

**Admin Account:**
- Email: `admin@test.com`
- Redirects to: `/admin` (Admin Dashboard)

**Influencer Account:**
- Email: `influencer@test.com`
- Redirects to: `/dashboard` (Influencer Dashboard)

### 4. Click "Sign In"

That's it! No password needed. The system will:
1. Look up the user by email
2. Create a session for them
3. Redirect to the appropriate dashboard

---

## How It Works

### Backend: `/api/auth/test-login`

**Endpoint:** `POST /api/auth/test-login`

**Request:**
```json
{
  "email": "admin@test.com"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@test.com",
    "firstName": "Test",
    "lastName": "Admin",
    "userType": "admin",
    "role": "admin",
    "isOnboarded": true
  }
}
```

**What it does:**
1. Validates email is provided
2. Looks up user in database by email
3. Creates a session (using passport/express-session)
4. Returns user data

### Frontend: `LoginPage.tsx`

The login page has been updated to:
- Accept email instead of password
- Call `/api/auth/test-login` endpoint
- Redirect based on user type:
  - `admin` → `/admin`
  - `influencer` → `/dashboard`

---

## Security Considerations

### Production Safety

The endpoint includes these protections:

```typescript
// Check if we're in production
if (process.env.NODE_ENV === "production" && process.env.ENABLE_TEST_LOGIN !== "true") {
  return res.status(403).json({
    error: "Test login is disabled in production"
  });
}
```

**By default, test login is disabled in production** unless you explicitly set:
```bash
ENABLE_TEST_LOGIN=true
```

### Recommendations

1. **Remove in Production:** Delete the test login endpoints before deploying to production
2. **Use Real Auth:** Set up proper OAuth or Magic Link authentication
3. **Environment Variables:** Never set `ENABLE_TEST_LOGIN=true` in production

---

## Testing Scenarios

### Test Admin Flow

1. Login with `admin@test.com`
2. Should see Admin Dashboard
3. Test:
   - Create a brief
   - View influencers
   - Assign brief to influencer
   - View submissions

### Test Influencer Flow

1. Login with `influencer@test.com`
2. Should see Influencer Dashboard
3. Test:
   - View assigned briefs
   - Click "Submit Video"
   - Upload submission
   - Check submission status

### Test Access Control

1. As influencer, try to access `/admin/briefs`
   - Should redirect to `/dashboard`
2. As admin, try to access `/dashboard`
   - Should redirect to `/admin`
3. While logged out, try to access `/admin` or `/dashboard`
   - Should redirect to `/login`

---

## Create Additional Test Accounts

To create more test accounts, run the SQL script:

```sql
-- See scripts/create-test-accounts.sql for examples

INSERT INTO users (id, email, first_name, last_name, user_type, role, is_onboarded, email_verified, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'newuser@test.com',
  'New',
  'User',
  'influencer',
  'admin',
  true,
  true,
  NOW(),
  NOW()
);
```

Then login with: `newuser@test.com`

---

## Troubleshooting

### "No user found with this email"

**Cause:** The user doesn't exist in the database

**Fix:**
1. Run the test account creation script: `scripts/create-test-accounts.sql`
2. Or create the user manually in your database

### Session not persisting / Redirects to login immediately

**Cause:** Session store not working or SESSION_SECRET not set

**Fix:**
1. Check `DATABASE_URL` is set in `.env`
2. Check `SESSION_SECRET` is set in `.env`
3. Verify `sessions` table exists in database
4. Clear browser cookies and try again

### "Test login is disabled in production"

**Cause:** Running in production mode

**Fix:**
- For development: Set `NODE_ENV=development`
- For production: Use real authentication instead

### Login successful but redirects to wrong page

**Cause:** User type mismatch

**Fix:**
Check the user's `user_type` in database:
```sql
SELECT email, user_type, role FROM users WHERE email = 'your@email.com';
```

Should be:
- Admin: `user_type = 'admin'` or `role = 'admin'`
- Influencer: `user_type = 'influencer'`

---

## Files Involved

### Backend
- `server/auth/testLogin.ts` - Test login endpoint
- `server/index.ts` - Registers test login routes

### Frontend
- `client/src/pages/auth/LoginPage.tsx` - Login form UI

---

## Transition to Real Authentication

When ready for production:

### Option 1: Magic Link (Email-based)
Already implemented! Routes available:
- `POST /api/auth/magic-link/request` - Send magic link
- `GET /api/auth/verify-magic-link` - Verify token

### Option 2: OAuth (Replit)
Already implemented! Routes available:
- `GET /api/login` - Start OAuth flow
- `GET /api/callback` - OAuth callback

### Steps to Switch:
1. Update `LoginPage.tsx` to use magic link or OAuth
2. Remove or disable test login endpoints
3. Test authentication flow
4. Deploy

---

## Quick Reference

| Email                   | User Type   | Dashboard   |
|------------------------|-------------|-------------|
| admin@test.com         | Admin       | /admin      |
| influencer@test.com    | Influencer  | /dashboard  |

**Login URL:** `http://localhost:5000/login`

**API Endpoint:** `POST /api/auth/test-login`

**Production:** Disabled by default

---

Happy testing! 🚀
