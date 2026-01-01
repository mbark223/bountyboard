import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { storage } from "../_lib/storage";
import { getUser } from "../_lib/auth";
import { insertInfluencerInviteSchema } from "../../shared/schema";

// Generate a secure random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const createInviteSchema = z.object({
  email: z.string().email(),
  message: z.string().optional(),
  expiresInDays: z.number().min(1).max(30).default(7)
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check authentication
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { email, message, expiresInDays } = createInviteSchema.parse(req.body);

    // Check if influencer already exists
    const existingInfluencer = await storage.getInfluencerByEmail(email);
    if (existingInfluencer) {
      return res.status(400).json({ error: "This email is already registered" });
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let existingInvite = await storage.getInviteByCode(inviteCode);
    
    // Ensure code is unique
    while (existingInvite) {
      inviteCode = generateInviteCode();
      existingInvite = await storage.getInviteByCode(inviteCode);
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create the invite
    const inviteData = insertInfluencerInviteSchema.parse({
      email,
      inviteCode,
      invitedBy: user.id,
      message,
      expiresAt
    });

    const invite = await storage.createInfluencerInvite(inviteData);

    // Generate invite URL
    const inviteUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/apply?code=${inviteCode}`;

    res.status(201).json({ 
      success: true,
      invite,
      inviteUrl,
      message: `Invite created successfully. Send this link to ${email}: ${inviteUrl}`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid invite data", details: error.errors });
    }
    console.error("Error creating invite:", error);
    res.status(500).json({ error: "Failed to create invite" });
  }
}