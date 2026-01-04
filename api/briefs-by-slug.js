// Simple JavaScript version of briefs by-slug endpoint
import { Pool } from 'pg';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({ error: 'Slug parameter is required' });
  }
  
  let pool;
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    console.log('[API] Fetching brief with slug:', slug);
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // First try to find by slug
    let query = `
      SELECT 
        b.*,
        u.org_name as user_org_name,
        u.org_slug,
        u.org_logo_url,
        u.org_website,
        u.org_description
      FROM briefs b
      LEFT JOIN users u ON b.owner_id = u.id
      WHERE b.slug = $1
    `;
    
    let result = await pool.query(query, [slug]);
    
    // If not found and slug looks like "brief-123", try to find by ID
    if (result.rows.length === 0 && slug.startsWith('brief-')) {
      const id = parseInt(slug.replace('brief-', ''));
      if (!isNaN(id)) {
        console.log('[API] Trying fallback with ID:', id);
        query = query.replace('WHERE b.slug = $1', 'WHERE b.id = $1');
        result = await pool.query(query, [id]);
      }
    }
    
    if (result.rows.length === 0) {
      console.log('[API] Brief not found for slug:', slug);
      return res.status(404).json({ error: 'Brief not found', slug });
    }
    
    // Transform snake_case to camelCase
    const row = result.rows[0];
    const brief = {
      id: row.id,
      slug: row.slug || `brief-${row.id}`, // Fallback to ID-based slug if null
      title: row.title,
      orgName: row.org_name,
      businessLine: row.business_line,
      state: row.state,
      overview: row.overview,
      requirements: row.requirements,
      deliverableRatio: row.deliverable_ratio,
      deliverableLength: row.deliverable_length,
      deliverableFormat: row.deliverable_format,
      rewardType: row.reward_type,
      rewardAmount: row.reward_amount,
      rewardCurrency: row.reward_currency,
      rewardDescription: row.reward_description,
      deadline: row.deadline,
      status: row.status,
      password: row.password,
      maxWinners: row.max_winners,
      maxSubmissionsPerCreator: row.max_submissions_per_creator,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      organization: {
        name: row.user_org_name || row.org_name,
        slug: row.org_slug,
        logoUrl: row.org_logo_url,
        website: row.org_website,
        description: row.org_description,
      }
    };
    
    console.log('[API] Brief found:', { id: brief.id, slug: brief.slug, title: brief.title });
    res.status(200).json(brief);
    
  } catch (error) {
    console.error('[API] Error fetching brief:', error);
    res.status(500).json({ 
      error: 'Failed to fetch brief',
      message: error.message,
      code: error.code,
      dbConfigured: !!process.env.DATABASE_URL
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}