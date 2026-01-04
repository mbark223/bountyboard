// JavaScript version of brief update endpoint
import { Pool } from 'pg';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  const { id } = req.query;
  const briefId = parseInt(id, 10);
  
  if (!id || isNaN(briefId)) {
    return res.status(400).json({ error: 'Invalid brief ID' });
  }
  
  let pool;
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    console.log('[API] Updating brief:', briefId);
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const {
      title,
      overview,
      requirements,
      businessLine,
      state,
      deliverableRatio,
      deliverableLength,
      deliverableFormat,
      reward,
      deadline,
      status,
      maxWinners,
      maxSubmissionsPerCreator
    } = req.body;
    
    // Build update query
    const updateQuery = `
      UPDATE briefs SET
        title = $2,
        overview = $3,
        requirements = $4,
        business_line = $5,
        state = $6,
        deliverable_ratio = $7,
        deliverable_length = $8,
        deliverable_format = $9,
        reward_type = $10,
        reward_amount = $11,
        reward_currency = $12,
        reward_description = $13,
        deadline = $14,
        status = $15,
        max_winners = $16,
        max_submissions_per_creator = $17,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      briefId,
      title,
      overview,
      requirements || [],
      businessLine,
      state,
      deliverableRatio,
      deliverableLength,
      deliverableFormat,
      reward?.type || 'CASH',
      reward?.amount || 0,
      reward?.currency || 'USD',
      reward?.description || null,
      deadline,
      status || 'PUBLISHED',
      maxWinners || 1,
      maxSubmissionsPerCreator || 3
    ];
    
    const result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brief not found' });
    }
    
    // Get updated submission count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM submissions WHERE brief_id = $1',
      [briefId]
    );
    const submissionCount = parseInt(countResult.rows[0].count);
    
    // Transform to camelCase format
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
      submissionCount: submissionCount
    };
    
    console.log('[API] Brief updated successfully:', brief.id);
    res.status(200).json(brief);
    
  } catch (error) {
    console.error('[API] Error updating brief:', error);
    res.status(500).json({ 
      error: 'Failed to update brief',
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}