import type { VercelRequest, VercelResponse } from '@vercel/node';

async function fetchBrandMetadata(url: string): Promise<{
  title?: string;
  description?: string;
  logo?: string;
  favicon?: string;
  ogImage?: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BountyBoard/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) throw new Error('Failed to fetch URL');
    
    const html = await response.text();
    
    const getMetaContent = (name: string): string | undefined => {
      const patterns = [
        new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']${name}["']`, 'i'),
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
      }
      return undefined;
    };
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = getMetaContent('og:site_name') || getMetaContent('og:title') || (titleMatch ? titleMatch[1].trim() : undefined);
    
    const description = getMetaContent('og:description') || getMetaContent('description');
    
    const ogImage = getMetaContent('og:image');
    
    const baseUrl = new URL(url);
    const faviconPatterns = [
      /<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i,
    ];
    
    let favicon: string | undefined;
    for (const pattern of faviconPatterns) {
      const match = html.match(pattern);
      if (match) {
        favicon = match[1].startsWith('http') ? match[1] : new URL(match[1], baseUrl.origin).href;
        break;
      }
    }
    if (!favicon) {
      favicon = `${baseUrl.origin}/favicon.ico`;
    }
    
    const logo = ogImage?.startsWith('http') ? ogImage : ogImage ? new URL(ogImage, baseUrl.origin).href : undefined;
    
    return { title, description, logo, favicon, ogImage: logo };
  } catch (error) {
    console.error('Error fetching brand metadata:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    
    try {
      const brandData = await fetchBrandMetadata(url);
      res.status(200).json(brandData);
    } catch (error) {
      console.error("Error fetching brand:", error);
      res.status(500).json({ 
        error: "Failed to fetch brand information", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}