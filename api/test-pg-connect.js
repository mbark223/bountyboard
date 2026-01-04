// Test 3: Try to create a pg Pool
export default async function handler(req, res) {
  try {
    const { Pool } = require('pg');
    
    if (!process.env.DATABASE_URL) {
      return res.status(200).json({ 
        success: false,
        test: 'pg-connect',
        error: 'DATABASE_URL not set'
      });
    }
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    res.status(200).json({ 
      success: true,
      test: 'pg-connect',
      message: 'Pool created successfully',
      poolConfig: {
        max: pool.options.max,
        hasSSL: !!pool.options.ssl
      }
    });
    
    // Important: end the pool to avoid connection leaks
    await pool.end();
    
  } catch (error) {
    res.status(200).json({ 
      success: false,
      test: 'pg-connect',
      error: error.message,
      stack: error.stack
    });
  }
}