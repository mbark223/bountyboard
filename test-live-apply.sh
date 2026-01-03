#!/bin/bash

echo "Testing /api/apply endpoint on https://bountyboard-kappa.vercel.app/"
echo "================================================"

# Generate unique email
EMAIL="test$(date +%s)@example.com"

echo -e "\nSending POST request to /api/apply with test data..."
echo "Email: $EMAIL"

curl -X POST https://bountyboard-kappa.vercel.app/api/apply \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "'$EMAIL'",
    "phone": "+1234567890",
    "instagramHandle": "@testuser",
    "tiktokHandle": "@testuser_tiktok"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n"