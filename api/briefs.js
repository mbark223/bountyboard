import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured in Vercel environment variables');
    }
    
    // Get published briefs with organization info
    const result = await query(`
      SELECT 
        b.*,
        u.org_name as user_org_name,
        u.org_slug,
        u.org_logo_url,
        u.org_website,
        u.org_description
      FROM briefs b
      LEFT JOIN users u ON b.owner_id = u.id
      WHERE b.status = 'PUBLISHED'
      ORDER BY b.created_at DESC
    `);
    
    // Transform the results to match expected format
    const briefs = result.rows.map((row: any) => ({
      id: row.id,
      slug: row.slug,
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
    }));
    
    console.log(`Returning ${briefs.length} published briefs`);
    res.status(200).json(briefs);
    
  } catch (error: any) {
    console.error('Error fetching briefs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch briefs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}