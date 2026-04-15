import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUser } from '../_lib/auth';

/**
 * Super simple test to check if auth is working
 * GET /api/admin/test-auth
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-email');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('[Test Auth] Headers:', req.headers);
    console.log('[Test Auth] Query:', req.query);

    const user = await getUser(req);

    console.log('[Test Auth] User:', user);

    if (!user) {
      return res.status(200).json({
        authenticated: false,
        headers: req.headers,
        message: 'No user found'
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      isAdmin: user.userType === 'admin' || user.role === 'admin'
    });

  } catch (error: any) {
    console.error('[Test Auth] Error:', error);
    return res.status(500).json({
      error: 'Auth test failed',
      message: error.message,
      stack: error.stack
    });
  }
}
