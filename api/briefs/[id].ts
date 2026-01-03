import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    try {
      const briefId = parseInt(id as string, 10);
      if (isNaN(briefId)) {
        return res.status(400).json({ error: "Invalid brief ID" });
      }
      
      const brief = await storage.getBriefById(briefId);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }
      
      res.status(200).json(brief);
    } catch (error) {
      console.error("Error fetching brief:", error);
      res.status(500).json({ error: "Failed to fetch brief" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}