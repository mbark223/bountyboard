import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { storage } from "../../_lib/storage";
import { getUser } from "../../_lib/auth";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "suspended"]),
  notes: z.string().optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check authentication
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.query;
    const influencerId = parseInt(id as string, 10);

    if (isNaN(influencerId)) {
      return res.status(400).json({ error: "Invalid influencer ID" });
    }

    const { status, notes } = updateStatusSchema.parse(req.body);

    // Update the influencer status
    const updatedInfluencer = await storage.updateInfluencerStatus(influencerId, status, notes);

    res.status(200).json(updatedInfluencer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    console.error("Error updating influencer status:", error);
    res.status(500).json({ error: "Failed to update influencer status" });
  }
}