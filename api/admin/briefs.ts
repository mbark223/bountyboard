import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'GET') {
    try {
      console.log("Fetching all briefs for admin...");
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
      
      console.log(`Returning ${briefsWithCounts.length} briefs with counts`);
      res.status(200).json(briefsWithCounts);
    } catch (error) {
      console.error("Error fetching admin briefs:", error);
      res.status(500).json({ 
        error: "Failed to fetch briefs",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}