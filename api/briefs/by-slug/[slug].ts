import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  
  if (req.method === 'GET') {
    try {
      console.log('Fetching brief with slug:', slug);
      const brief = await storage.getBriefBySlug(slug as string);
      if (!brief) {
        console.log('Brief not found for slug:', slug);
        return res.status(404).json({ error: "Brief not found" });
      }
      console.log('Brief found:', brief.title);
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