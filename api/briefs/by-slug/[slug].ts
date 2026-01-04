import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  
  if (req.method === 'GET') {
    try {
      console.log('[API] Fetching brief with slug:', slug);
      console.log('[API] Type of slug:', typeof slug);
      console.log('[API] DATABASE_URL exists:', !!process.env.DATABASE_URL);
      
      // Add more error context
      if (!slug) {
        return res.status(400).json({ error: "Slug parameter is required" });
      }
      
      const brief = await storage.getBriefBySlug(slug as string);
      
      if (!brief) {
        console.log('[API] Brief not found for slug:', slug);
        console.log('[API] Will fallback work? Starts with "brief-":', slug?.toString().startsWith('brief-'));
        return res.status(404).json({ error: "Brief not found", slug: slug });
      }
      
      console.log('[API] Brief found:', { id: brief.id, title: brief.title, slug: brief.slug });
      res.status(200).json(brief);
    } catch (error: any) {
      console.error("[API] Error fetching brief:", error);
      console.error("[API] Error stack:", error.stack);
      
      // Check for database connection errors
      if (error.message?.includes('Database')) {
        return res.status(500).json({ 
          error: "Database connection error", 
          details: "Please check DATABASE_URL configuration in Vercel environment variables",
          configured: !!process.env.DATABASE_URL
        });
      }
      
      res.status(500).json({ 
        error: "Failed to fetch brief", 
        details: error.message,
        type: error.constructor.name 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}