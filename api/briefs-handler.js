// Combined handler for GET and PUT requests to /api/briefs/:id
import { Pool } from 'pg';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    if (req.method === 'GET') {
      // Handle GET request (fetch brief)
      console.log('[API] Fetching brief with ID:', briefId);
      
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
      
    } else if (req.method === 'PUT') {
      // Handle PUT request (update brief)
      console.log('[API] Updating brief:', briefId);
      
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
      
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    
  } catch (error) {
    console.error('[API] Error handling brief request:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
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