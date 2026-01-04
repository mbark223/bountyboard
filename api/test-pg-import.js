// Test 2: Check if we can import pg module
import pg from 'pg';

export default function handler(req, res) {
  try {
    res.status(200).json({ 
      success: true,
      test: 'pg-import',
      pgVersion: pg.version || 'version not found',
      hasPgClient: !!pg.Client,
      hasPgPool: !!pg.Pool
    });
  } catch (error) {
    res.status(200).json({ 
      success: false,
      test: 'pg-import',
      error: error.message,
      stack: error.stack
    });
  }
}