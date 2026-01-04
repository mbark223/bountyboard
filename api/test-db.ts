import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const diagnostics = {
    environment: {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    // Simple test without using our storage layer
    if (process.env.DATABASE_URL) {
      const { Client } = await import('pg');
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
      });
      
      try {
        await client.connect();
        const result = await client.query('SELECT COUNT(*) as count FROM briefs');
        diagnostics['briefs_count'] = result.rows[0].count;
        diagnostics['database_connected'] = true;
        await client.end();
      } catch (dbError) {
        diagnostics['database_error'] = dbError.message;
        diagnostics['database_connected'] = false;
      }
    }
    
    res.status(200).json(diagnostics);
  } catch (error) {
    diagnostics['error'] = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json(diagnostics);
  }
}