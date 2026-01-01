import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { storage } from "../_lib/storage";
import { insertInfluencerSchema } from "../../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { inviteCode, ...applicationData } = req.body;

    // Check if invite code is provided and valid
    if (inviteCode) {
      const invite = await storage.getInviteByCode(inviteCode);
      if (!invite) {
        return res.status(400).json({ error: "Invalid invite code" });
      }
      if (invite.status !== "pending") {
        return res.status(400).json({ error: "Invite code already used or expired" });
      }
      if (new Date(invite.expiresAt) < new Date()) {
        await storage.expireInvite(invite.id);
        return res.status(400).json({ error: "Invite code has expired" });
      }
    }

    // Check if influencer already exists
    const existingInfluencer = await storage.getInfluencerByEmail(applicationData.email);
    if (existingInfluencer) {
      return res.status(400).json({ error: "An application with this email already exists" });
    }

    // Validate the application data
    const validated = insertInfluencerSchema.parse(applicationData);

    // Create the influencer application
    const influencer = await storage.createInfluencer(validated);

    // If invite code was used, mark it as accepted
    if (inviteCode) {
      const invite = await storage.getInviteByCode(inviteCode);
      if (invite) {
        await storage.acceptInvite(inviteCode, influencer.id);
      }
    }

    res.status(201).json({ 
      success: true,
      message: "Application submitted successfully. We'll review it and get back to you soon!",
      applicationId: influencer.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid application data", details: error.errors });
    }
    console.error("Error creating influencer application:", error);
    res.status(500).json({ error: "Failed to submit application" });
  }
}