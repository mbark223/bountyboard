import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      // For admin, we want to see all briefs, not just published ones
      const allBriefs = await storage.getAllBriefs();
      
      // Add submission count to each brief
      const briefsWithCounts = await Promise.all(
        allBriefs.map(async (brief) => {
          const submissions = await storage.getSubmissionsByBriefId(brief.id);
          return {
            ...brief,
            submissionCount: submissions.length,
            reward: {
              type: brief.rewardType,
              amount: brief.rewardAmount,
              currency: brief.rewardCurrency || 'USD',
              description: brief.rewardDescription
            }
          };
        })
      );
      
      res.status(200).json(briefsWithCounts);
    } catch (error) {
      console.error("Error fetching admin briefs:", error);
      res.status(500).json({ error: "Failed to fetch briefs" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}