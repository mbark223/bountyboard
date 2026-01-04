// JavaScript version of briefs by ID endpoint
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
  
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }
  
  const briefId = parseInt(id, 10);
  if (isNaN(briefId)) {
    return res.status(400).json({ error: 'Invalid brief ID' });
  }
  
  let pool;
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    console.log('[API] Fetching brief with ID:', briefId);
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const query = `
      SELECT 
        b.*,
        u.org_name as user_org_name,
        u.org_slug,
        u.org_logo_url,
        u.org_website,
        u.org_description
      FROM briefs b
      LEFT JOIN users u ON b.owner_id = u.id
      WHERE b.id = $1
    `;
    
    const result = await pool.query(query, [briefId]);
    
    if (result.rows.length === 0) {
      console.log('[API] Brief not found for ID:', briefId);
      return res.status(404).json({ error: 'Brief not found' });
    }
    
    // Get submission count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM submissions WHERE brief_id = $1',
      [briefId]
    );
    const submissionCount = parseInt(countResult.rows[0].count);
    
    // Transform snake_case to camelCase
    const row = result.rows[0];
    const brief = {
      id: row.id,
      slug: row.slug || `brief-${row.id}`,
      title: row.title,
      orgName: row.org_name,
      businessLine: row.business_line,
      state: row.state,
      overview: row.overview,
      requirements: row.requirements,
      deliverableRatio: row.deliverable_ratio,
      deliverableLength: row.deliverable_length,
      deliverableFormat: row.deliverable_format,
      reward: {
        type: row.reward_type,
        amount: row.reward_amount,
        currency: row.reward_currency,
        description: row.reward_description,
      },
      deadline: row.deadline,
      status: row.status,
      password: row.password,
      maxWinners: row.max_winners,
      maxSubmissionsPerCreator: row.max_submissions_per_creator,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      submissionCount: submissionCount,
      organization: {
        name: row.user_org_name || row.org_name,
        slug: row.org_slug,
        logoUrl: row.org_logo_url,
        website: row.org_website,
        description: row.org_description,
      }
    };
    
    console.log('[API] Brief found:', { id: brief.id, title: brief.title });
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