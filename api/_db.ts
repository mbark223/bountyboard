import { Pool } from 'pg';

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable is not set');
      throw new Error('DATABASE_URL environment variable is not set. Please set it in Vercel environment variables.');
    }
    
    console.log('Creating new database pool...');
    
    try {
      pool = new Pool({
        connectionString: databaseUrl,
        max: 1, // Serverless functions should use minimal connections
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
        ssl: {
          rejectUnauthorized: false // Required for Supabase
        }
      });
      
      console.log('Database pool created successfully');
    } catch (error) {
      console.error('Failed to create database pool:', error);
      throw error;
    }
  }
  
  return pool;
}

export async function query(text: string, params?: any[]): Promise<any> {
  const pool = getPool();
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}