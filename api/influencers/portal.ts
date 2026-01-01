import { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if influencer exists and is approved
    const influencer = await storage.getInfluencerByEmail(email);
    
    if (!influencer) {
      return res.status(404).json({ error: "Influencer not found" });
    }
    
    if (influencer.status !== "approved") {
      return res.status(403).json({ error: "Access denied. Your application is still under review." });
    }

    // Get all published briefs
    const briefs = await storage.getAllPublishedBriefs();

    // Update last active time - this would be done in production
    // await storage.updateInfluencer(influencer.id, { lastActiveAt: new Date() });

    res.status(200).json({
      influencer: {
        id: influencer.id,
        firstName: influencer.firstName,
        lastName: influencer.lastName,
        email: influencer.email,
        instagramHandle: influencer.instagramHandle,
        status: influencer.status
      },
      briefs
    });
  } catch (error) {
    console.error("Error fetching influencer portal data:", error);
    res.status(500).json({ error: "Failed to fetch portal data" });
  }
}