import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { storage } from "../../_lib/storage";
import { getUser, requireAdmin } from "../../_lib/auth";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "suspended"]),
  notes: z.string().optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check authentication and require admin
    const user = await getUser(req);
    requireAdmin(user);

    const { id } = req.query;
    const influencerId = parseInt(id as string, 10);

    if (isNaN(influencerId)) {
      return res.status(400).json({ error: "Invalid influencer ID" });
    }

    const { status, notes } = updateStatusSchema.parse(req.body);

    // Get influencer before update
    const influencer = await storage.getInfluencerById(influencerId);
    if (!influencer) {
      return res.status(404).json({ error: "Influencer not found" });
    }

    // Update the influencer status
    const updatedInfluencer = await storage.updateInfluencerStatus(influencerId, status, notes);

    // If approved, create user account
    if (status === 'approved' && influencer.status !== 'approved') {
      // Check if user account already exists
      const existingUser = await storage.getUserByEmail(influencer.email);

      if (!existingUser) {
        // Create user account for the influencer
        await storage.createUser({
          email: influencer.email,
          firstName: influencer.firstName,
          lastName: influencer.lastName,
          profileImageUrl: influencer.profileImageUrl,
          userType: 'influencer',
          role: 'admin', // Set default role
          influencerId: influencer.id,
          isOnboarded: true,
          emailVerified: true,
        });

        console.log(`[Admin] ${user.email} - approved influencer ${influencer.email} and created user account`);
      } else {
        // Link existing user to influencer
        await storage.updateUser(existingUser.id, {
          userType: 'influencer',
          influencerId: influencer.id,
        });

        console.log(`[Admin] ${user.email} - approved influencer ${influencer.email} and linked to existing user`);
      }

      // TODO: Send approval notification email to influencer
    }

    res.status(200).json(updatedInfluencer);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (error.message.includes('Forbidden')) {
      return res.status(403).json({ error: error.message });
    }
    console.error("Error updating influencer status:", error);
    res.status(500).json({ error: "Failed to update influencer status" });
  }
}