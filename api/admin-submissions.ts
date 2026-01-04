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

  const { briefId } = req.query;
  
  if (!briefId) {
    res.status(400).json({ error: 'briefId is required' });
    return;
  }

  try {
    // Get submissions with creator info
    const submissionsResult = await query(`
      SELECT 
        s.*,
        u.username as creator_username,
        u.email as creator_email,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name
      FROM submissions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.brief_id = $1
      ORDER BY s.submitted_at DESC
    `, [briefId]);
    
    // Get brief info
    const briefResult = await query(`
      SELECT 
        b.*,
        u.org_name as user_org_name
      FROM briefs b
      LEFT JOIN users u ON b.owner_id = u.id
      WHERE b.id = $1
    `, [briefId]);
    
    if (!briefResult.rows[0]) {
      res.status(404).json({ error: 'Brief not found' });
      return;
    }
    
    const brief = briefResult.rows[0];
    
    // Transform submissions to nested format expected by client
    const submissions = submissionsResult.rows.map((row: any) => ({
      id: row.id,
      videoUrl: row.video_url,
      status: row.status,
      submittedAt: row.submitted_at,
      feedback: row.feedback,
      creatorId: row.user_id,
      briefId: row.brief_id,
      brief: {
        id: brief.id,
        slug: brief.slug,
        title: brief.title,
        orgName: brief.org_name,
        rewardType: brief.reward_type,
        rewardAmount: brief.reward_amount,
        rewardCurrency: brief.reward_currency,
        rewardDescription: brief.reward_description,
        reward: {
          type: brief.reward_type,
          amount: brief.reward_amount,
          currency: brief.reward_currency || 'USD',
          description: brief.reward_description
        }
      },
      creator: {
        id: row.user_id,
        username: row.creator_username,
        email: row.creator_email,
        firstName: row.creator_first_name,
        lastName: row.creator_last_name,
        name: row.creator_first_name && row.creator_last_name 
          ? `${row.creator_first_name} ${row.creator_last_name}`
          : row.creator_username || row.creator_email
      }
    }));
    
    console.log(`Returning ${submissions.length} submissions for brief ${briefId}`);
    res.status(200).json(submissions);
    
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch submissions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}