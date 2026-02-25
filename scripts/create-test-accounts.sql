-- =====================================================
-- Create Test Accounts for Two-Flow Authentication
-- =====================================================
-- Run this in your PostgreSQL database
-- (via pgAdmin, Neon console, Supabase dashboard, etc.)

-- 1. Create Test Admin Account
INSERT INTO users (id, email, first_name, last_name, user_type, role, is_onboarded, email_verified, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@test.com',
  'Test',
  'Admin',
  'admin',
  'admin',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 2. Create Test Influencer Record (Approved)
INSERT INTO influencers (
  first_name,
  last_name,
  email,
  phone,
  instagram_handle,
  tiktok_handle,
  instagram_followers,
  status,
  id_verified,
  bank_verified,
  approved_at,
  created_at,
  updated_at
)
VALUES (
  'Test',
  'Influencer',
  'influencer@test.com',
  '+1 (555) 123-4567',
  'testinfluencer',
  'testinfluencer',
  10000,
  'approved',
  1,
  1,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- 3. Create User Account for Test Influencer
-- Note: Replace <INFLUENCER_ID> with the ID returned from step 2
-- Or run this query to link automatically:
INSERT INTO users (id, email, first_name, last_name, user_type, role, influencer_id, is_onboarded, email_verified, created_at, updated_at)
SELECT
  gen_random_uuid(),
  i.email,
  i.first_name,
  i.last_name,
  'influencer',
  'admin',
  i.id,
  true,
  true,
  NOW(),
  NOW()
FROM influencers i
WHERE i.email = 'influencer@test.com'
AND NOT EXISTS (
  SELECT 1 FROM users WHERE users.email = 'influencer@test.com'
);

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if accounts were created
SELECT 'Admin Account:' as account_type, email, first_name, last_name, user_type
FROM users
WHERE email = 'admin@test.com'

UNION ALL

SELECT 'Influencer Account:', email, first_name, last_name, user_type
FROM users
WHERE email = 'influencer@test.com';

-- Check influencer record
SELECT
  'Influencer Record:' as type,
  email,
  first_name || ' ' || last_name as name,
  instagram_handle,
  instagram_followers,
  status
FROM influencers
WHERE email = 'influencer@test.com';

-- =====================================================
-- Test Login Credentials
-- =====================================================
-- Admin:        admin@test.com
-- Influencer:   influencer@test.com
--
-- Use your app's authentication method (Magic Link, OAuth, etc.)
-- =====================================================
