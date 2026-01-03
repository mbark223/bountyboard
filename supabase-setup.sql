-- Create sessions table (required for authentication)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  org_name VARCHAR,
  org_slug VARCHAR UNIQUE,
  org_logo_url TEXT,
  org_website TEXT,
  org_description TEXT,
  is_onboarded BOOLEAN DEFAULT false,
  role VARCHAR DEFAULT 'admin',
  user_type VARCHAR DEFAULT 'admin',
  influencer_id INTEGER,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create magic_links table
CREATE TABLE IF NOT EXISTS magic_links (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL,
  token VARCHAR UNIQUE NOT NULL,
  user_id VARCHAR REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create briefs table
CREATE TABLE IF NOT EXISTS briefs (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  org_name TEXT NOT NULL,
  business_line TEXT NOT NULL DEFAULT 'Sportsbook',
  state TEXT NOT NULL DEFAULT 'Florida',
  overview TEXT NOT NULL,
  requirements TEXT[] NOT NULL,
  deliverable_ratio TEXT NOT NULL,
  deliverable_length TEXT NOT NULL,
  deliverable_format TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_amount TEXT NOT NULL,
  reward_currency TEXT DEFAULT 'USD',
  reward_description TEXT,
  deadline TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  password TEXT,
  max_winners INTEGER DEFAULT 1,
  max_submissions_per_creator INTEGER DEFAULT 3,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  brief_id INTEGER NOT NULL REFERENCES briefs(id),
  creator_id TEXT,
  creator_name TEXT NOT NULL,
  creator_email TEXT NOT NULL,
  creator_phone TEXT,
  creator_handle TEXT NOT NULL,
  creator_betting_account TEXT,
  message TEXT,
  video_url TEXT NOT NULL,
  video_file_name TEXT NOT NULL,
  video_mime_type TEXT NOT NULL,
  video_size_bytes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  payout_status TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
  payout_amount DECIMAL,
  payout_notes TEXT,
  reviewed_by TEXT,
  review_notes TEXT,
  selected_at TIMESTAMP,
  paid_at TIMESTAMP,
  submitted_at TIMESTAMP DEFAULT NOW() NOT NULL,
  has_feedback INTEGER DEFAULT 0,
  parent_submission_id INTEGER,
  submission_version INTEGER DEFAULT 1,
  allows_resubmission INTEGER DEFAULT 1
);

-- Create reviewers table
CREATE TABLE IF NOT EXISTS reviewers (
  id SERIAL PRIMARY KEY,
  brief_id INTEGER NOT NULL REFERENCES briefs(id),
  user_id TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  can_select INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create prompt_templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
  id SERIAL PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  overview TEXT,
  requirements TEXT[],
  deliverable_ratio TEXT,
  deliverable_length TEXT,
  deliverable_format TEXT,
  reward_type TEXT,
  reward_amount TEXT,
  reward_currency TEXT,
  reward_description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id),
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  requires_action INTEGER DEFAULT 0,
  is_read INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create influencers table
CREATE TABLE IF NOT EXISTS influencers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  profile_image_url TEXT,
  instagram_handle TEXT NOT NULL,
  instagram_followers INTEGER,
  instagram_verified INTEGER DEFAULT 0,
  tiktok_handle TEXT,
  youtube_channel TEXT,
  bank_account_holder_name TEXT,
  bank_routing_number TEXT,
  bank_account_number TEXT,
  bank_account_type TEXT,
  tax_id_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  id_verified INTEGER DEFAULT 0,
  bank_verified INTEGER DEFAULT 0,
  admin_notes TEXT,
  rejection_reason TEXT,
  applied_at TIMESTAMP DEFAULT NOW() NOT NULL,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  last_active_at TIMESTAMP,
  notification_preferences TEXT DEFAULT 'all',
  preferred_payment_method TEXT DEFAULT 'bank'
);

-- Create influencer_invites table
CREATE TABLE IF NOT EXISTS influencer_invites (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  invited_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  influencer_id INTEGER
);

-- Add some sample data for testing
-- Create a test admin user
INSERT INTO users (email, first_name, last_name, org_name, org_slug, is_onboarded, role, user_type)
VALUES ('admin@bountyboard.com', 'Admin', 'User', 'BountyBoard', 'bountyboard', true, 'admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create a sample brief
INSERT INTO briefs (
  slug, title, org_name, overview, requirements, 
  deliverable_ratio, deliverable_length, deliverable_format,
  reward_type, reward_amount, deadline, status, owner_id
)
VALUES (
  'test-brief-2024',
  'Test Video Brief',
  'BountyBoard',
  'Create an engaging video showcasing our platform',
  ARRAY['Must be vertical format', 'Include call to action', 'Show enthusiasm'],
  '9:16',
  '15-30 seconds',
  'MP4 or MOV',
  'CASH',
  '100',
  NOW() + INTERVAL '30 days',
  'PUBLISHED',
  (SELECT id FROM users WHERE email = 'admin@bountyboard.com' LIMIT 1)
)
ON CONFLICT (slug) DO NOTHING;