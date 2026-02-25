# Testing Guide: Two-Flow Authentication System

## Prerequisites

Before testing, ensure you have:
1. ✅ Database migration run: `npm run db:push`
2. ✅ Application running: `npm run dev`
3. ✅ Database with at least one admin user

## Quick Start Testing

### Step 1: Create Test Admin User (if needed)

If you don't have an admin user yet, create one in your database:

```sql
-- Create admin user
INSERT INTO users (id, email, first_name, last_name, user_type, role, is_onboarded, email_verified, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@hardrock.com',
  'Admin',
  'User',
  'admin',
  'admin',
  true,
  true,
  NOW(),
  NOW()
);
```

### Step 2: Start the Application

```bash
npm run dev
```

Application should be running at `http://localhost:5000`

---

## Test Flow 1: Influencer Registration & Approval

### 1.1 Test Influencer Registration

**Objective:** Verify self-service registration creates pending influencer

**Steps:**
1. Open browser to `http://localhost:5000/apply`
2. Fill out the registration form:
   - First Name: `Test`
   - Last Name: `Influencer`
   - Email: `test.influencer@example.com`
   - Phone: `+1 (555) 123-4567` (optional)
   - Instagram Handle: `@testinfluencer`
   - TikTok Handle: `@testinfluencer` (optional)
3. Click "Submit Application"

**Expected Result:**
- ✅ Redirect to `/apply/success` page
- ✅ Success message displayed
- ✅ Database check: `SELECT * FROM influencers WHERE email = 'test.influencer@example.com'` should show record with `status = 'pending'`

**Test Edge Cases:**
- Missing required fields → Should show validation errors
- Duplicate email → Should show "Influencer with this email already exists"
- Invalid email format → Should show validation error

---

### 1.2 Test Admin Approval Flow

**Objective:** Verify admin can approve influencer and user account is created

**Steps:**
1. Login as admin (use your existing admin credentials)
2. Navigate to `/admin/influencers`
3. Find the pending influencer (Test Influencer)
4. Click "Approve" button
5. Confirm approval

**Expected Result:**
- ✅ Influencer status changes to "approved"
- ✅ Toast notification: "Influencer approved successfully"
- ✅ Database check: User account created:
  ```sql
  SELECT * FROM users WHERE email = 'test.influencer@example.com';
  -- Should show user with user_type = 'influencer'
  ```

**Test the Login:**
1. Logout from admin account
2. Try to login with `test.influencer@example.com`
3. Should successfully authenticate (if using magic link or OAuth)

---

## Test Flow 2: Admin Creates Brief & Assigns Influencers

### 2.1 Test Brief Creation

**Objective:** Verify admin can create a new brief

**Steps:**
1. Login as admin
2. Go to `/admin/briefs/new`
3. Fill out brief form:
   - Title: `Test Brief - Hard Rock Campaign`
   - Description: `Create engaging content for Hard Rock`
   - Deadline: Set to 7 days from now
   - Reward Type: `CASH` or `BONUS_BETS`
   - Reward Amount: `500`
   - Max Submissions: `1`
4. Click "Create Brief"

**Expected Result:**
- ✅ Brief created successfully
- ✅ Redirect to brief detail page
- ✅ Brief shows in `/admin/briefs` list
- ✅ Database check: `SELECT * FROM briefs WHERE title LIKE 'Test Brief%'`

---

### 2.2 Test Brief Assignment

**Objective:** Verify admin can assign influencers to briefs

**Steps:**
1. From brief detail page, click "Manage Assignments" button
2. Should navigate to `/admin/briefs/:id/assignments`
3. See list of approved influencers (including Test Influencer)
4. Check the checkbox next to "Test Influencer"
5. Or click "Assign" button

**Expected Result:**
- ✅ Assignment created successfully
- ✅ Toast notification: "Influencer assigned successfully"
- ✅ Assigned count increases (shown in stats cards)
- ✅ Badge changes from "Not Assigned" to "Assigned"
- ✅ Database check:
  ```sql
  SELECT * FROM brief_assignments
  WHERE brief_id = [brief_id] AND influencer_id = [influencer_id];
  ```

**Test Search/Filter:**
- Use search bar to filter by name, email, or Instagram handle
- Verify filtering works in real-time

**Test Bulk Assignment:**
- Check multiple influencers
- All should be assigned successfully

**Test Unassignment:**
- Uncheck checkbox or click "Remove" button
- Assignment should be removed
- Count should decrease

---

## Test Flow 3: Influencer Accesses & Submits

### 3.1 Test Influencer Dashboard

**Objective:** Verify influencer sees only assigned briefs

**Steps:**
1. Logout from admin account
2. Login as Test Influencer (`test.influencer@example.com`)
3. Should auto-redirect to `/dashboard`

**Expected Result:**
- ✅ Dashboard loads successfully
- ✅ Shows welcome message: "Welcome, Test!"
- ✅ Stats cards show:
  - Assigned Briefs: `1`
  - Active Campaigns: `1` (if deadline not passed)
  - Submissions: `0`
- ✅ Brief card displayed with:
  - Organization name badge
  - Brief title
  - Overview text
  - Reward amount
  - Deadline countdown
  - "Submit Video" button

**Test Empty State:**
1. Create a second influencer and approve them (without assignment)
2. Login as that influencer
3. Should see "No Assigned Briefs Yet" message

---

### 3.2 Test Brief Access Control

**Objective:** Verify influencer can only access assigned briefs

**Steps:**
1. Still logged in as Test Influencer
2. Click on the assigned brief card
3. Should navigate to `/briefs/:id`
4. Currently shows placeholder: "Brief Detail Page - Coming soon"

**Test Unauthorized Access:**
1. Create a second brief (as admin) but don't assign to Test Influencer
2. As Test Influencer, try to access `/briefs/:id` with the unassigned brief ID
3. **Expected:** Should not see it in dashboard
4. Direct URL access to `/api/briefs/:id` should return 403

---

### 3.3 Test Submission Flow

**Objective:** Verify influencer can submit to assigned briefs

**Steps:**
1. As Test Influencer on dashboard
2. Click "Submit Video" button on assigned brief
3. Should navigate to `/briefs/:id/submit`
4. Fill out submission form:
   - Upload video file
   - Add description/notes
   - Complete any required fields
5. Click "Submit"

**Expected Result:**
- ✅ Submission created successfully
- ✅ Toast notification: "Submission successful"
- ✅ Redirect to confirmation page or dashboard
- ✅ Database check:
  ```sql
  SELECT * FROM submissions WHERE brief_id = [brief_id];
  -- Should show submission with creator_id linked to influencer's user account
  ```

**Test Blocked Submission:**
1. As admin, remove Test Influencer's assignment to the brief
2. As Test Influencer, try to access `/briefs/:id/submit` (direct URL)
3. **Expected:** 403 error or redirect
4. Try to POST to `/api/submissions` for that brief
5. **Expected:** Error: "You are not assigned to this brief"

---

## Test Flow 4: Security & Access Control

### 4.1 Test Unauthenticated Access

**Objective:** Verify public cannot access protected routes

**Steps:**
1. Logout completely (no session)
2. Try to access these URLs directly:
   - `/admin` → Should redirect to `/login`
   - `/admin/briefs` → Should redirect to `/login`
   - `/dashboard` → Should redirect to `/login`
   - `/briefs/:id` → Should redirect to `/login`

**Expected Result:**
- ✅ All protected routes redirect to login page
- ✅ No brief data exposed

**Test Public Routes Still Work:**
- `/` (landing page) → Should load
- `/login` → Should load
- `/apply` → Should load
- `/apply/success` → Should load

---

### 4.2 Test Role-Based Access Control

**Objective:** Verify users can only access their role's routes

**As Admin User:**
1. Login as admin
2. Try to access `/dashboard`
3. **Expected:** Should redirect to `/admin` (admin dashboard)

**As Influencer User:**
1. Login as influencer
2. Try to access `/admin/briefs`
3. **Expected:** Should redirect to `/dashboard`
4. Try to access `/admin/influencers`
5. **Expected:** Should redirect to `/dashboard`

---

### 4.3 Test API Endpoint Protection

**Objective:** Verify API endpoints check authentication and permissions

**Test with Postman or curl:**

**1. Get Briefs (Unauthenticated):**
```bash
curl http://localhost:5000/api/briefs
```
**Expected:** 401 Unauthorized

**2. Get Briefs (As Admin):**
- Login as admin first (get session cookie)
- Make request with session cookie
```bash
curl http://localhost:5000/api/briefs \
  --cookie "connect.sid=[your-session-cookie]"
```
**Expected:** 200 OK, returns admin's owned briefs

**3. Get Briefs (As Influencer):**
- Login as influencer (get session cookie)
- Make request with session cookie
```bash
curl http://localhost:5000/api/briefs \
  --cookie "connect.sid=[your-session-cookie]"
```
**Expected:** 200 OK, returns only assigned briefs

**4. Create Assignment (As Non-Admin):**
```bash
curl -X POST http://localhost:5000/api/admin/brief-assignments \
  -H "Content-Type: application/json" \
  -d '{"briefId": 1, "influencerId": 1}' \
  --cookie "connect.sid=[influencer-session-cookie]"
```
**Expected:** 403 Forbidden

---

## Test Flow 5: Edge Cases & Error Handling

### 5.1 Pending Influencer Access

**Steps:**
1. Create new influencer via `/apply`
2. Do NOT approve them (leave as pending)
3. Try to login as that influencer
4. If login succeeds, try to access `/api/briefs`

**Expected:**
- ✅ Should return error: "Account pending approval"
- ✅ Dashboard should show appropriate message

---

### 5.2 Duplicate Assignment Prevention

**Steps:**
1. As admin, assign Test Influencer to a brief
2. Try to assign the same influencer to the same brief again

**Expected:**
- ✅ Error message: "Assignment already exists" or similar
- ✅ Database unique constraint prevents duplicate

---

### 5.3 Assignment After Deadline

**Steps:**
1. Create a brief with deadline in the past
2. Assign influencer to that brief
3. As influencer, view the brief in dashboard

**Expected:**
- ✅ Brief shows "Deadline passed" badge
- ✅ "Submit Video" button is disabled or shows "View Details"

---

## Automated Testing Script

Here's a quick SQL script to verify the database state:

```sql
-- Check brief assignments
SELECT
  b.title AS brief_title,
  i.first_name || ' ' || i.last_name AS influencer_name,
  ba.assigned_at,
  ba.status
FROM brief_assignments ba
JOIN briefs b ON ba.brief_id = b.id
JOIN influencers i ON ba.influencer_id = i.id;

-- Check user accounts linked to influencers
SELECT
  u.email,
  u.user_type,
  u.first_name || ' ' || u.last_name AS user_name,
  i.status AS influencer_status
FROM users u
LEFT JOIN influencers i ON u.influencer_id = i.id
WHERE u.user_type = 'influencer';

-- Check submissions with creator info
SELECT
  s.id,
  s.brief_id,
  u.email AS creator_email,
  s.status,
  s.submitted_at
FROM submissions s
LEFT JOIN users u ON s.creator_id = u.id;
```

---

## Common Issues & Troubleshooting

### Issue 1: "Authentication required" on all endpoints
**Cause:** Session not being stored or read correctly
**Fix:** Check `DATABASE_URL` is set and sessions table exists

### Issue 2: Influencer can't see assigned briefs
**Cause:** Assignment not created or influencer not approved
**Fix:**
1. Verify influencer status is 'approved'
2. Check brief_assignments table has record
3. Verify influencer has user account

### Issue 3: Admin can't assign influencers
**Cause:** Brief ownership mismatch
**Fix:** Ensure admin user ID matches brief owner_id

### Issue 4: Cannot submit to assigned brief
**Cause:** Assignment check failing
**Fix:**
1. Verify assignment exists in database
2. Check influencer_id matches user's linked influencer
3. Verify influencer status is 'approved'

---

## Manual Testing Checklist

### Authentication
- [ ] Unauthenticated users redirected to /login
- [ ] Admin role can access /admin/* routes
- [ ] Influencer role can access /dashboard
- [ ] Cross-role access blocked

### Influencer Registration
- [ ] Can register via /apply
- [ ] Creates pending influencer record
- [ ] Success page shows after registration
- [ ] Duplicate email prevented

### Influencer Approval
- [ ] Admin can view pending influencers
- [ ] Admin can approve influencer
- [ ] User account auto-created on approval
- [ ] Influencer can login after approval

### Brief Assignment
- [ ] Admin can view assignment management page
- [ ] Shows only approved influencers
- [ ] Can assign via checkbox or button
- [ ] Can unassign influencers
- [ ] Assignment count updates in real-time
- [ ] Search/filter works correctly

### Influencer Dashboard
- [ ] Shows only assigned briefs
- [ ] Stats display correctly
- [ ] Brief cards show all info
- [ ] Submit button navigates correctly
- [ ] Empty state for no assignments

### Submission Flow
- [ ] Influencer can access submission form for assigned brief
- [ ] Cannot access submission form for unassigned brief
- [ ] Submission creates record with creator_id
- [ ] Admin can view submissions

### Security
- [ ] No public access to briefs
- [ ] API endpoints require authentication
- [ ] Role-based filtering works
- [ ] Permission checks prevent unauthorized access

---

## Performance Testing

### Load Test Assignment Page
```bash
# Using Apache Bench (if installed)
ab -n 100 -c 10 http://localhost:5000/api/admin/brief-assignments?briefId=1 \
  -C "connect.sid=[your-session-cookie]"
```

### Check Query Performance
```sql
-- Should use index on brief_id
EXPLAIN ANALYZE
SELECT * FROM brief_assignments WHERE brief_id = 1;

-- Should use index on influencer_id
EXPLAIN ANALYZE
SELECT * FROM brief_assignments WHERE influencer_id = 1;
```

---

## Success Criteria

✅ All user flows complete without errors
✅ Authentication and authorization work correctly
✅ No public access to briefs
✅ Assignments tracked accurately
✅ Submissions linked to authenticated users
✅ Performance acceptable (page loads < 2s)

---

## Next Steps After Testing

1. **Run full end-to-end tests** in production-like environment
2. **Monitor logs** for any authentication errors
3. **Test with real users** (small group first)
4. **Set up monitoring** for failed auth attempts
5. **Document any additional edge cases** discovered

Happy testing! 🚀
