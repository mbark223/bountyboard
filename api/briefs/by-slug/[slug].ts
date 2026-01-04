import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  
  if (req.method === 'GET') {
    try {
      console.log('[API] Fetching brief with slug:', slug);
      console.log('[API] Type of slug:', typeof slug);
      console.log('[API] Storage instance:', storage.constructor.name);
      
      const brief = await storage.getBriefBySlug(slug as string);
      
      if (!brief) {
        console.log('[API] Brief not found for slug:', slug);
        console.log('[API] Will fallback work? Starts with "brief-":', slug?.toString().startsWith('brief-'));
        return res.status(404).json({ error: "Brief not found", slug: slug });
      }
      
      console.log('[API] Brief found:', { id: brief.id, title: brief.title, slug: brief.slug });
      res.status(200).json(brief);
    } catch (error) {
      console.error("[API] Error fetching brief:", error);
      res.status(500).json({ error: "Failed to fetch brief", details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}