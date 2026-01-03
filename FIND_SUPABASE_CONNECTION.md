# Finding Your Supabase Connection String

## Method 1: Database Settings Page

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Look for **Settings** (gear icon) in the left sidebar
4. Click on **Database**
5. Look for one of these sections:
   - **Connection String**
   - **Connection Pooling**
   - **Direct Connection**

## Method 2: Project Settings Home

1. In your Supabase project
2. Click on **Settings** (gear icon)
3. On the main settings page, look for a **Database** card
4. It might show the connection info right there

## Method 3: Getting Started / Home Page

1. Go to your project's home/dashboard
2. Look for a section called **Connect** or **Quick Start**
3. There might be a dropdown to select your framework
4. The connection string is often shown there

## Method 4: Manual Construction

If you can't find it anywhere, you can construct it manually:

1. Find your project details:
   - **Project URL**: Found on the home page (looks like `https://[your-ref].supabase.co`)
   - **Database Password**: You set this when creating the project

2. Your connection string format:
```
postgresql://postgres:[YOUR-DATABASE-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

For pooled connections (recommended):
```
postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-DATABASE-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:5432/postgres
```

## Method 5: API Settings

1. Go to **Settings** → **API**
2. Look for your project URL and anon key
3. Your project reference is the part before `.supabase.co`

## What to Look For

The connection string will look like one of these:

**Direct connection:**
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

**Pooled connection (better for serverless):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

## Can't Find Your Database Password?

1. Go to **Settings** → **Database**
2. Look for **Reset Database Password**
3. Set a new password (save it!)
4. Use this new password in your connection string

## Still Can't Find It?

Tell me:
1. What sections do you see under Settings?
2. What's your project URL (the one that looks like `https://xxxxx.supabase.co`)?
3. Do you remember your database password?

I can help you construct the connection string manually.