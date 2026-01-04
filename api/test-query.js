// Test 4: Try to run a simple query
export default async function handler(req, res) {
  const { Pool } = require('pg');
  let pool;
  
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(200).json({ 
        success: false,
        test: 'query',
        error: 'DATABASE_URL not set'
      });
    }
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const result = await pool.query('SELECT NOW() as time, 1+1 as math');
    
    res.status(200).json({ 
      success: true,
      test: 'query',
      result: {
        time: result.rows[0].time,
        math: result.rows[0].math,
        rowCount: result.rowCount
      }
    });
    
  } catch (error) {
    res.status(200).json({ 
      success: false,
      test: 'query',
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