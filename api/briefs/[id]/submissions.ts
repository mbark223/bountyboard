import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    try {
      const briefId = parseInt(id as string, 10);
      if (isNaN(briefId)) {
        return res.status(400).json({ error: "Invalid brief ID" });
      }
      
      const submissions = await storage.getSubmissionsByBriefId(briefId);
      res.status(200).json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}