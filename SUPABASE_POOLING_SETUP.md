# Supabase Connection Pooling Setup Guide

## Why Connection Pooling?

Serverless environments (like Vercel) create new connections for each request, which can overwhelm your database. Connection pooling solves this by maintaining a pool of reusable connections.

## Setup Steps

### 1. Enable Pooling in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings → Database**
3. Find the **Connection Pooling** section
4. Toggle **"Connection pooling enabled"** to ON
5. Select **"Transaction"** mode (recommended for serverless)

### 2. Update Your Connection String

After enabling pooling, you'll get a new connection string:

- **Direct connection**: `postgresql://[user]:[password]@[host]:5432/postgres`
- **Pooled connection**: `postgresql://[user]:[password]@[host]:6543/postgres` (note port 6543)

### 3. Update Environment Variables

In Vercel:
1. Go to your project settings
2. Navigate to Environment Variables
3. Update `DATABASE_URL` with the **pooled connection string** (port 6543)

Example:
```
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 4. Connection Pool Settings

For serverless environments, use these pool settings:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Minimal connections for serverless
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 10000,
});
```

### 5. Important Notes

- Always use the pooled connection string (port 6543) for serverless deployments
- The direct connection (port 5432) should only be used for migrations or admin tasks
- Transaction mode is best for serverless as it allows more concurrent connections
- Each serverless function should use `max: 1` to avoid connection exhaustion

## Troubleshooting

If you still get connection errors:
1. Verify you're using the pooled connection string (port 6543)
2. Check that pooling is enabled in Supabase dashboard
3. Ensure your connection string includes `?pgbouncer=true` parameter
4. Try adding `?sslmode=require` if SSL errors occur