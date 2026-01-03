# Connecting Supabase to Vercel - Step by Step Guide

## Step 1: Get Your Supabase Database URL

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on the **Settings** icon (gear) in the left sidebar
4. Click on **Database** in the settings menu
5. Find the section called **Connection string**
6. You'll see a dropdown - select **URI**
7. Click the **Copy** button to copy the connection string

The connection string looks like this:
```
postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

**Important**: Make sure you're copying the URI version, not the other formats.

## Step 2: Add Database URL to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **bountyboard-kappa**
3. Click on the **Settings** tab at the top
4. In the left sidebar, click on **Environment Variables**
5. Click the **Add New** button
6. Fill in:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your Supabase connection string here
   - **Environment**: Select all three (Production, Preview, Development)
7. Click **Save**

## Step 3: Redeploy Your Application

After adding the environment variable, you need to redeploy:

1. Go to the **Deployments** tab in your Vercel project
2. Find the most recent deployment
3. Click the three dots menu (...) 
4. Click **Redeploy**
5. In the popup, click **Redeploy** again

## Step 4: Verify the Connection

Visit: https://bountyboard-kappa.vercel.app/api/test-db

You should see something like:
```json
{
  "databaseConfigured": true,
  "databaseUrlLength": 150,
  "nodeEnv": "production",
  "timestamp": "2024-01-03T..."
}
```

## Troubleshooting

### If you see "databaseConfigured": false

1. Double-check that the environment variable name is exactly `DATABASE_URL` (all caps)
2. Make sure you clicked Save after adding it
3. Make sure you redeployed after adding the variable

### If you get connection errors even with databaseConfigured: true

1. Check if your Supabase project is paused (free tier pauses after 1 week of inactivity)
2. Make sure you're using the **Pooler** connection string (it should contain "pooler" in the URL)
3. Try using the **Transaction** pooler mode instead of Session pooler mode

### Still having issues?

1. In Supabase, go to Settings → Database
2. Scroll down to **Connection Pooling**
3. Make sure it's enabled
4. Copy the connection string from the **Connection Pooling** section instead

## Alternative: Use Vercel's Supabase Integration

1. Go to [Vercel Integrations](https://vercel.com/integrations/supabase)
2. Click **Add Integration**
3. Select your Vercel team/account
4. Select your bountyboard-kappa project
5. Follow the prompts to connect your Supabase project

This will automatically add all necessary environment variables.