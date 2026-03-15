#!/bin/bash

# Script to create test accounts directly in database via psql
# Run this with: bash scripts/create-test-accounts-api.sh

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  echo "Please set it with: export DATABASE_URL='your-postgres-connection-string'"
  exit 1
fi

echo "Creating test accounts in database..."
echo ""

# Execute SQL to create test accounts
psql "$DATABASE_URL" <<'EOF'
-- Create Test Admin Account
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
ON CONFLICT (email) DO UPDATE SET
  user_type = 'admin',
  role = 'admin',
  is_onboarded = true,
  email_verified = true,
  updated_at = NOW();

-- Create Test Influencer Record (Approved)
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
ON CONFLICT (email) DO UPDATE SET
  status = 'approved',
  id_verified = 1,
  bank_verified = 1,
  approved_at = NOW(),
  updated_at = NOW();

-- Create User Account for Test Influencer
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
ON CONFLICT (email) DO UPDATE SET
  user_type = 'influencer',
  influencer_id = (SELECT id FROM influencers WHERE email = 'influencer@test.com'),
  is_onboarded = true,
  email_verified = true,
  updated_at = NOW();

-- Verify accounts were created
SELECT 'Test accounts created successfully!' as status;
SELECT email, first_name, last_name, user_type, role FROM users WHERE email IN ('admin@test.com', 'influencer@test.com');
EOF

echo ""
echo "✅ Test accounts created!"
echo ""
echo "Test credentials:"
echo "  Admin:      admin@test.com"
echo "  Influencer: influencer@test.com"
