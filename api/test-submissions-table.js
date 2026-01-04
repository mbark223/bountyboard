// Test endpoint to check submissions table structure
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
    
    // Check submissions table structure
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'submissions' 
      ORDER BY ordinal_position
    `);
    
    // Get a sample submission
    const sampleResult = await pool.query(`
      SELECT * FROM submissions 
      ORDER BY id DESC 
      LIMIT 1
    `);
    
    res.status(200).json({
      columns: columnsResult.rows,
      sampleSubmission: sampleResult.rows[0] || null,
      hasReviewNotes: columnsResult.rows.some(col => col.column_name === 'review_notes'),
      hasAllowsResubmission: columnsResult.rows.some(col => col.column_name === 'allows_resubmission'),
      hasUpdatedAt: columnsResult.rows.some(col => col.column_name === 'updated_at')
    });
    
  } catch (error) {
    console.error('[Test] Error:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}