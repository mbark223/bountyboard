import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { videoStorage } from "../_lib/video-storage";
import { storage } from "../_lib/storage";

const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().regex(/^video\/.+/),
  fileSizeBytes: z.number().min(1).max(500 * 1024 * 1024), // Max 500MB
  briefId: z.number(),
  creatorEmail: z.string().email(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = uploadRequestSchema.parse(req.body);
    
    // Verify brief exists and is published
    const brief = await storage.getBriefBySlug(data.briefId.toString());
    if (!brief) {
      return res.status(404).json({ error: "Brief not found" });
    }
    
    // Generate upload URL
    const uploadData = await videoStorage.generateUploadUrl({
      fileName: data.fileName,
      fileType: data.fileType,
      fileSizeBytes: data.fileSizeBytes,
      briefId: data.briefId,
      creatorEmail: data.creatorEmail,
    });
    
    res.status(200).json({
      uploadUrl: uploadData.uploadUrl,
      videoKey: uploadData.videoKey,
      publicUrl: uploadData.publicUrl,
      expiresAt: uploadData.expiresAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
}