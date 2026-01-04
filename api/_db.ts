import { Pool } from 'pg';

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1, // Serverless functions should use minimal connections
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
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