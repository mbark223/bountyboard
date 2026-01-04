import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';
import { insertBriefSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'GET') {
    try {
      console.log("Fetching published briefs...");
      const allBriefs = await storage.getAllPublishedBriefs();
      console.log(`Found ${allBriefs.length} published briefs`);
      res.status(200).json(allBriefs);
    } catch (error) {
      console.error("Error fetching briefs:", error);
      res.status(500).json({ 
        error: "Failed to fetch briefs",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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