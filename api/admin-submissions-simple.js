// JavaScript version of admin submissions endpoint
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
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { briefId } = req.query;
  
  if (!briefId) {
    return res.status(400).json({ error: 'briefId is required' });
  }

  let pool;
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Get submissions with creator info
    const submissionsResult = await pool.query(`
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
    const briefResult = await pool.query(`
      SELECT 
        b.*,
        u.org_name as user_org_name
      FROM briefs b
      LEFT JOIN users u ON b.owner_id = u.id
      WHERE b.id = $1
    `, [briefId]);
    
    if (briefResult.rows.length === 0) {
      return res.status(404).json({ error: 'Brief not found' });
    }
    
    const brief = briefResult.rows[0];
    
    // Transform submissions to nested format expected by client
    const submissions = submissionsResult.rows.map(row => ({
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
    
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch submissions',
      message: error.message
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}