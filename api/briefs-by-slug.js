// Protected endpoint - brief by slug with authentication
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

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug parameter is required' });
  }

  try {
    // Check authentication
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get the brief
    const brief = await storage.getBriefBySlug(slug);

    if (!brief) {
      console.log(`[Auth] Brief not found for slug: ${slug}`);
      return res.status(404).json({ error: 'Brief not found' });
    }

    // Check permissions
    // Admins can view briefs they own
    if (user.userType === 'admin' || user.role === 'admin') {
      if (brief.ownerId === user.id) {
        console.log(`[Auth] Admin ${user.email} - viewing owned brief: ${brief.title}`);
        return res.status(200).json(brief);
      } else {
        console.log(`[Auth] Admin ${user.email} - denied access to brief owned by ${brief.ownerId}`);
        return res.status(403).json({ error: 'You do not own this brief' });
      }
    }

    // Influencers can only view assigned briefs
    if (user.userType === 'influencer') {
      const influencer = await storage.getInfluencerByEmail(user.email);

      if (!influencer) {
        console.log(`[Auth] Influencer ${user.email} - no influencer record found`);
        return res.status(403).json({ error: 'Influencer profile not found' });
      }

      if (influencer.status !== 'approved') {
        console.log(`[Auth] Influencer ${user.email} - status: ${influencer.status}`);
        return res.status(403).json({
          error: 'Account pending approval',
          status: influencer.status
        });
      }

      // Check if influencer is assigned to this brief
      const assignment = await storage.getBriefAssignment(brief.id, influencer.id);

      if (!assignment) {
        console.log(`[Auth] Influencer ${user.email} - not assigned to brief: ${brief.title}`);
        return res.status(403).json({ error: 'You are not assigned to this brief' });
      }

      console.log(`[Auth] Influencer ${user.email} - viewing assigned brief: ${brief.title}`);
      return res.status(200).json(brief);
    }

    // Other user types not allowed
    console.log(`[Auth] User ${user.email} - unauthorized userType: ${user.userType}`);
    return res.status(403).json({ error: 'Access denied' });

  } catch (error) {
    console.error('[API] Error fetching brief:', error);
    res.status(500).json({
      error: 'Failed to fetch brief',
      message: error.message
    });
  }
}
