# Getting Your Pooled Connection String in Supabase

Since you already have connection pooling configured (SHARED POOLER), you just need to get the pooled connection string. Here's where to find it:

## Steps to Get Pooled Connection String:

1. **Go back to the main Database page** (not Settings)
   - Click on "Database" in the left sidebar (without going into Settings)

2. **Look for "Connection String" section**
   - You should see a card or section titled "Connection string" or "Database URL"

3. **Find the connection type selector**
   - Look for a dropdown, toggle, or tabs that let you choose between:
     - "URI" vs "PSQL" (format type)
     - "Connection pooling" vs "Direct connection" (connection type)
     - Or similar options

4. **Select the pooled connection**
   - Choose "Connection pooling" or "Pooler"
   - The connection string should change to show port 6543 instead of 5432

## What the URLs Look Like:

**Direct connection (DO NOT USE for Vercel):**
```
postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

**Pooled connection (USE THIS for Vercel):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Key Differences:
- Port: 6543 (pooled) vs 5432 (direct)
- Host: includes "pooler" in the domain
- Mode: Your SHARED POOLER is already configured

## Update in Vercel:
Once you have the pooled connection string:
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Update `DATABASE_URL` with the pooled connection string

The connection string page is usually in the main Database section, not in Settings.