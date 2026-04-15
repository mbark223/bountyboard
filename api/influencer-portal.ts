import { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from './_lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.query;
    console.log('[Influencer Portal] Request for email:', email);

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if influencer exists and is approved
    console.log('[Influencer Portal] Fetching influencer...');
    const influencer = await storage.getInfluencerByEmail(email);
    console.log('[Influencer Portal] Influencer result:', influencer ? 'found' : 'not found');

    if (!influencer) {
      return res.status(404).json({ error: "Influencer not found" });
    }

    console.log('[Influencer Portal] Influencer status:', influencer.status);
    if (influencer.status !== "approved") {
      return res.status(403).json({ error: "Access denied. Your application is still under review." });
    }

    // Get only assigned briefs for this influencer (not all briefs)
    console.log('[Influencer Portal] Fetching assigned briefs for ID:', influencer.id);
    const briefs = await storage.getAssignedBriefs(influencer.id);
    console.log(`[Influencer Portal] Returning ${briefs.length} assigned briefs for ${email}`);

    res.status(200).json({
      talent: {
        id: influencer.id,
        firstName: influencer.firstName,
        lastName: influencer.lastName,
        email: influencer.email,
        instagramHandle: influencer.instagramHandle,
        status: influencer.status
      },
      briefs
    });
  } catch (error: any) {
    console.error("Error fetching influencer portal data:", error);
    res.status(500).json({
      error: "Failed to fetch portal data",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}