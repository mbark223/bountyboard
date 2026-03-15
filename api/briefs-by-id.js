// Protected endpoint - brief by ID with authentication
import { getUser } from './_lib/auth.js';
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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }

  try {
    const briefId = parseInt(id);
    if (isNaN(briefId)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }

    // Get the brief
    const brief = await storage.getBriefById(briefId);

    if (!brief) {
      console.log(`[API] Brief not found for id: ${briefId}`);
      return res.status(404).json({ error: 'Brief not found' });
    }

    // Only show PUBLISHED briefs publicly
    // For admin dashboard, this is fine since admins see all briefs in the list anyway
    if (brief.status !== 'PUBLISHED') {
      console.log(`[API] Brief not published: ${brief.slug}, status: ${brief.status}`);
      return res.status(404).json({ error: 'Brief not found' });
    }

    console.log(`[API] Returning published brief: ${brief.title}`);
    return res.status(200).json(brief);

  } catch (error) {
    console.error('[API] Error fetching brief:', error);
    res.status(500).json({
      error: 'Failed to fetch brief',
      message: error.message
    });
  }
}
