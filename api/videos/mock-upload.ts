import { VercelRequest, VercelResponse } from "@vercel/node";

// Mock upload endpoint for development
// In production, this would be replaced by direct uploads to cloud storage
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow both PUT and POST for flexibility
  if (req.method !== "PUT" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // In a real implementation, this would:
    // 1. Validate the upload token
    // 2. Stream the file to cloud storage
    // 3. Return the final URL
    
    // For now, we'll just simulate a successful upload
    console.log("Mock video upload received");
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    res.status(200).json({
      success: true,
      message: "Video uploaded successfully (mock)",
    });
  } catch (error) {
    console.error("Error in mock upload:", error);
    res.status(500).json({ error: "Failed to upload video" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
};