// Test endpoint for submissions
import { Pool } from 'pg';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { briefId } = req.query;
  
  let pool;
  
  try {
    console.log('[Test] Starting test with briefId:', briefId);
    console.log('[Test] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Test basic query
    const testResult = await pool.query('SELECT 1 as test');
    console.log('[Test] Basic query works:', testResult.rows[0]);
    
    // Test submissions table
    const countResult = await pool.query('SELECT COUNT(*) as count FROM submissions');
    console.log('[Test] Total submissions:', countResult.rows[0].count);
    
    if (briefId) {
      // Test specific brief submissions
      const briefResult = await pool.query(
        'SELECT COUNT(*) as count FROM submissions WHERE brief_id = $1',
        [briefId]
      );
      console.log('[Test] Submissions for brief:', briefResult.rows[0].count);
    }
    
    res.status(200).json({
      success: true,
      dbConnected: true,
      totalSubmissions: countResult.rows[0].count,
      briefSubmissions: briefId ? briefResult.rows[0].count : null
    });
    
  } catch (error) {
    console.error('[Test] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}