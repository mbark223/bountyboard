# Brief Bounty Builder - Demo Guide

This guide will walk you through demonstrating both the **Admin Flow** and **Influencer Flow** for the Brief Bounty Builder platform.

## Setup Instructions

Before starting the demo, run the following command to populate test data:

```bash
npm run seed
```

This creates:
- 3 test briefs (2 published, 1 draft)
- 12 submissions with various statuses
- 5 influencer profiles (3 approved, 1 pending, 1 rejected)
- Feedback entries for rejected submissions

## Test Accounts

### Admin Access
- Use Replit Auth to sign in as admin
- Navigate to `/admin` to access the admin dashboard

### Influencer Accounts (for portal demo)
- **Approved Influencers:**
  - `sarah.j@example.com` - 45k followers, verified
  - `mike.c@example.com` - 28k followers
  - `jess.alva@example.com` - 72k followers, verified
- **Pending Influencer:**
  - `emma.t@example.com` - 15k followers
- **Rejected Influencer:**
  - `david.g@example.com` - 5k followers (below minimum)

---

## Admin Flow Demo (10-15 minutes)

### 1. Dashboard Overview (2 mins)
**Navigate to:** `/admin`

Show and explain:
- **Key Metrics:** Active briefs (2), Total submissions (12), Pending reviews
- **Recent Briefs:** List showing submission counts
- **Activity Feed:** Recent actions in the system

### 2. Brief Management (3 mins)
**Navigate to:** `/admin/briefs`

Demonstrate:
- **Brief List View:**
  - Filter by business line (PMR, Casino, Sportsbook)
  - Filter by state (Florida, New Jersey, Michigan)
  - Search functionality
  - Quick actions menu (View, Edit, Archive)

- **Create New Brief:** Click "New Brief" button
  - Fill out basic information
  - Set requirements and deliverables
  - Configure reward (Cash, Bonus Bets, Other)
  - Set max winners and submissions per creator
  - Save as draft or publish immediately

### 3. Submission Review (5 mins)
**Navigate to:** `/admin/briefs/1` (Summer Vibes Campaign)

Show the submission management interface:
- **12 test submissions** with various statuses
- Click "Review" on any submission to demonstrate:
  - Video preview with thumbnail
  - Creator information
  - Submission details
  
**Select a Winner:**
- Choose a pending submission
- Click "Select" 
- Show how status changes to SELECTED
- Demonstrate payment tracking

**Reject with Feedback:**
- Choose another submission
- Click "Reject"
- Add feedback: "Great energy but product wasn't visible in first 3 seconds"
- Toggle "Allow resubmission" option
- Show how feedback is saved

### 4. Influencer Management (3 mins)
**Navigate to:** `/admin/influencers`

Demonstrate each tab:
- **Pending Tab:** Show Emma Thompson's application
  - Review profile details
  - Check social media stats
  - Click "Approve" or "Reject" with notes
  
- **Approved Tab:** Show active influencers
  - Verification badges (ID, Bank)
  - Last active dates
  - Admin notes capability

- **Send Invite:** Click "Send Invite" button
  - Enter email address
  - Add personalized message
  - System generates unique invite code

---

## Influencer Flow Demo (10-15 minutes)

### 1. New Influencer Application (3 mins)
**Navigate to:** `/influencers/apply`

Walk through the application form:
- Personal information section
- Social media handles and follower counts
- Banking information for payments
- Submit application
- Show success message about pending review

### 2. Portal Access (2 mins)
**Navigate to:** `/portal`

- Enter email: `sarah.j@example.com`
- Click "Access Portal"
- Show welcome screen with "Approved Creator" badge
- Display available briefs

### 3. Browse Briefs (3 mins)
Show the brief cards with:
- Organization branding
- Brief title and overview
- Reward details (amount and type)
- Video requirements (format, length)
- Deadline countdown
- "Submit Video" and "View Details" buttons

Click "View Details" on Summer Vibes Campaign to show:
- Full brief description
- All requirements listed
- Deliverable specifications

### 4. Submit Video (5 mins)
**Navigate to:** `/influencer/submit/1`

Demonstrate the submission process:
- **Video Upload:**
  - Drag and drop a test video file
  - Show upload progress bar
  - File validation (size, format)
  
- **Submission Form:**
  - Optional message to brand
  - Shows "Submitting as: Sarah Jenkins (@sarahcreates)"
  - Submit button

- **Success Page:**
  - Confirmation message
  - Next steps explanation
  - Return to portal button

### 5. View Feedback (2 mins)
**Using Jessica's account:** `jess.alva@example.com`

- Access portal and show rejected submission
- Display rejection feedback
- Show "Resubmit" option if allowed
- Explain the feedback loop benefits

---

## Key Selling Points to Emphasize

### For Brands/Admins:
1. **Streamlined Brief Creation:** Quick setup with templates
2. **Efficient Review Process:** All submissions in one place
3. **Clear Communication:** Feedback system for quality control
4. **Payment Tracking:** Built-in payout management
5. **Influencer Vetting:** Comprehensive approval process

### For Influencers:
1. **Simple Access:** No complex passwords, just email
2. **Clear Requirements:** Know exactly what brands want
3. **Fair Feedback:** Understand why submissions are rejected
4. **Resubmission Options:** Second chances to get it right
5. **Professional Profile:** Verified badges build trust

---

## Common Questions & Answers

**Q: Can influencers see other submissions?**
A: No, submissions are private between the creator and brand.

**Q: How are payments processed?**
A: Through the banking information collected during application. Admins mark payments as completed.

**Q: Can briefs be edited after publishing?**
A: Yes, admins can edit briefs at any time, though it's best practice to avoid major changes after submissions start.

**Q: Is there a mobile app?**
A: The web platform is mobile-responsive and works well on all devices.

**Q: How do influencers get notified?**
A: Email notifications are sent for application status, selection results, and feedback.

---

## Technical Notes

- **Mock Storage:** Video uploads use mock storage in development
- **Authentication:** Admin uses Replit Auth, influencers use email-based access
- **Database:** PostgreSQL with test data via seed script
- **Real-time Updates:** React Query provides instant UI updates

---

## Demo Troubleshooting

If you encounter issues:

1. **Can't see submissions:** Run `npm run seed` to populate data
2. **Auth issues:** Check Replit Auth configuration
3. **Upload fails:** Ensure mock storage endpoints are running
4. **Missing routes:** Check both server routes and API routes are defined

For additional support, check the README.md file or contact the development team.