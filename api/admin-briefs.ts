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
    // Get all briefs with organization info and submission counts
    const briefsResult = await query(`
      SELECT 
        b.*,
        u.org_name as user_org_name,
        u.org_slug,
        u.org_logo_url,
        u.org_website,
        u.org_description,
        COUNT(DISTINCT s.id) as submission_count
      FROM briefs b
      LEFT JOIN users u ON b.owner_id = u.id
      LEFT JOIN submissions s ON b.id = s.brief_id
      GROUP BY b.id, u.id
      ORDER BY b.created_at DESC
    `);
    
    // Transform the results to match expected format
    const briefs = briefsResult.rows.map((row: any) => ({
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
      submissionCount: parseInt(row.submission_count) || 0,
      reward: {
        type: row.reward_type,
        amount: row.reward_amount,
        currency: row.reward_currency || 'USD',
        description: row.reward_description
      },
      organization: {
        name: row.user_org_name || row.org_name,
        slug: row.org_slug,
        logoUrl: row.org_logo_url,
        website: row.org_website,
        description: row.org_description,
      }
    }));
    
    console.log(`Returning ${briefs.length} briefs for admin`);
    res.status(200).json(briefs);
    
  } catch (error: any) {
    console.error('Error fetching admin briefs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch briefs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}