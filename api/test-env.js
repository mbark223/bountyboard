// Test 1: Check environment variables
export default function handler(req, res) {
  res.status(200).json({ 
    success: true,
    test: 'environment-variables',
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    nodeVersion: process.version,
    env: process.env.NODE_ENV || 'not set',
    vercelEnv: process.env.VERCEL_ENV || 'not set'
  });
}