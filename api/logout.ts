import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET' || req.method === 'POST') {
    // Clear the user_email cookie
    res.setHeader('Set-Cookie', [
      'user_email=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    ]);

    console.log('[Logout] User logged out, cookie cleared');

    // Redirect to home page
    res.redirect(302, '/');
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}