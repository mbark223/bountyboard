// Test endpoint to check brief ID 2
import { Pool } from 'pg';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  let pool;
  
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Check if brief 2 exists
    const briefResult = await pool.query('SELECT id, title, status FROM briefs WHERE id = $1', [2]);
    
    // Check submissions for brief 2
    const submissionsResult = await pool.query('SELECT COUNT(*) as count FROM submissions WHERE brief_id = $1', [2]);
    
    // Check if feedback table exists and has proper structure
    const feedbackCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'feedback' 
      ORDER BY ordinal_position
    `);
    
    res.status(200).json({
      brief: briefResult.rows[0] || null,
      submissionsCount: submissionsResult.rows[0]?.count || 0,
      feedbackColumns: feedbackCheck.rows
    });
    
  } catch (error) {
    console.error('[Test] Error:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}