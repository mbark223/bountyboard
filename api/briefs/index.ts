import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';
import { insertBriefSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const allBriefs = await storage.getAllPublishedBriefs();
      res.status(200).json(allBriefs);
    } catch (error) {
      console.error("Error fetching briefs:", error);
      res.status(500).json({ error: "Failed to fetch briefs" });
    }
  } else if (req.method === 'POST') {
    try {
      // Add demo user ID - in production would get from session
      const validated = insertBriefSchema.parse({
        ...req.body,
        ownerId: "demo-user-1"
      });
      const newBrief = await storage.createBrief(validated);
      res.status(201).json(newBrief);
    } catch (error) {
      console.error("Error creating brief:", error);
      res.status(500).json({ error: "Failed to create brief" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}