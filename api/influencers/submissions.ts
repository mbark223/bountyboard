import { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, briefId } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    // Get all submissions for this email
    let submissions;
    if (briefId && typeof briefId === "string") {
      const briefIdNum = parseInt(briefId, 10);
      if (isNaN(briefIdNum)) {
        return res.status(400).json({ error: "Invalid brief ID" });
      }
      
      // Get submissions for specific brief
      const allSubmissions = await storage.getSubmissionsByBriefId(briefIdNum);
      submissions = allSubmissions.filter(
        s => s.creatorEmail.toLowerCase() === email.toLowerCase()
      );
    } else {
      // Get all submissions for this email across all briefs
      // Note: This is a simplified implementation. In production, 
      // you'd want a more efficient query
      const allBriefs = await storage.getAllPublishedBriefs();
      submissions = [];
      
      for (const brief of allBriefs) {
        const briefSubmissions = await storage.getSubmissionsByBriefId(brief.id);
        const userSubmissions = briefSubmissions.filter(
          s => s.creatorEmail.toLowerCase() === email.toLowerCase()
        );
        submissions.push(...userSubmissions);
      }
    }

    // Sort by submission date, newest first
    submissions.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching influencer submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
}