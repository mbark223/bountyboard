import { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { getUser } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check authentication for admin access
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { status } = req.query;
    const influencers = await storage.getAllInfluencers(status as string);

    res.status(200).json(influencers);
  } catch (error) {
    console.error("Error fetching influencers:", error);
    res.status(500).json({ error: "Failed to fetch influencers" });
  }
}