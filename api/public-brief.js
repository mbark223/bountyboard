// Public endpoint - anyone can view PUBLISHED briefs by slug
import { storage } from './_lib/storage.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug parameter is required' });
  }

  try {
    console.log('[Public] Fetching brief by slug:', slug);

    // Get the brief
    const brief = await storage.getBriefBySlug(slug);

    if (!brief) {
      console.log('[Public] Brief not found for slug:', slug);
      return res.status(404).json({ error: 'Brief not found' });
    }

    // Only allow viewing PUBLISHED briefs publicly
    if (brief.status !== 'PUBLISHED') {
      console.log('[Public] Brief not published:', slug, 'status:', brief.status);
      return res.status(404).json({ error: 'Brief not found' });
    }

    console.log('[Public] Returning published brief:', brief.title);
    return res.status(200).json(brief);

  } catch (error) {
    console.error('[Public] Error fetching brief:', error);
    res.status(500).json({
      error: 'Failed to fetch brief',
      message: error.message
    });
  }
}
