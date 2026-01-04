import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[Test DB] Starting database connection test...');
    console.log('[Test DB] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('[Test DB] DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    
    // Try to get database instance
    const db = getDb();
    console.log('[Test DB] Database instance created');
    
    // Try a simple query
    const result = await db.execute('SELECT 1 as test');
    console.log('[Test DB] Query executed successfully');
    
    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful',
      dbConfigured: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Test DB] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      dbConfigured: !!process.env.DATABASE_URL
    });
  }
}