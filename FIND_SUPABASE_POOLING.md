# Finding Connection Pooling in Supabase

## Current Supabase Dashboard Navigation

### Method 1: Database Settings
1. Go to your Supabase project dashboard
2. Look for **"Settings"** in the left sidebar (gear icon)
3. Click on **"Database"**
4. Scroll down to find **"Connection string"** section
5. Look for a dropdown or tabs that say:
   - **"Direct connection"** 
   - **"Connection pooling"** or **"Pooler"**

### Method 2: Connection String Section
1. In the Database settings page
2. Find the **"Connection string"** card
3. You should see options for:
   - Mode: Session/Transaction
   - Connection type toggle or dropdown

### What to Look For

The pooling option might appear as:
- A toggle switch labeled "Use connection pooling"
- A dropdown to select between "Direct" and "Pooled"
- Tabs for "Direct connection" vs "Connection pooling"
- A section called "Connection Pooler" or "PgBouncer"

### If You Don't See Pooling Options

1. **Check your Supabase plan**: Connection pooling might not be available on the free tier
2. **Look for "Connection strings"**: Sometimes the pooled connection is just provided as an alternative connection string
3. **Check under "Database" → "Connection Info"**: The location might vary

### Alternative: Just Use the Pooled Connection String

Even if you can't find a toggle, Supabase often provides both connection strings:

**Direct connection (port 5432):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].supabase.co:5432/postgres
```

**Pooled connection (port 6543):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Note the differences:
- Port changes from 5432 to 6543
- Domain includes "pooler" subdomain

### Can you share:
1. What options do you see under Settings → Database?
2. Do you see different connection string options?
3. What's your Supabase plan (Free/Pro)?