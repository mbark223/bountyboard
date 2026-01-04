// JavaScript version of feedback delete endpoint
import { Pool } from 'pg';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { id } = req.query;
  const feedbackId = parseInt(id, 10);
  
  if (!id || isNaN(feedbackId)) {
    return res.status(400).json({ error: 'Invalid feedback ID' });
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
    
    if (req.method === 'DELETE') {
      console.log('[API] Deleting feedback:', feedbackId);
      
      const deleteQuery = 'DELETE FROM feedback WHERE id = $1 RETURNING id';
      const result = await pool.query(deleteQuery, [feedbackId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      
      console.log('[API] Feedback deleted:', feedbackId);
      res.status(200).json({ message: 'Feedback deleted successfully' });
      
    } else if (req.method === 'PATCH') {
      const { comment } = req.body;
      
      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ error: 'Comment is required' });
      }
      
      console.log('[API] Updating feedback:', feedbackId);
      
      const updateQuery = `
        UPDATE feedback 
        SET comment = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING 
          id,
          submission_id as "submissionId",
          author_id as "authorId",
          author_name as "authorName",
          comment,
          requires_action as "requiresAction",
          created_at as "createdAt"
      `;
      
      const result = await pool.query(updateQuery, [feedbackId, comment.trim()]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      
      console.log('[API] Feedback updated:', feedbackId);
      res.status(200).json(result.rows[0]);
      
    } else {
      res.setHeader('Allow', ['DELETE', 'PATCH']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    
  } catch (error) {
    console.error('[API] Error handling feedback:', error);
    res.status(500).json({ 
      error: 'Failed to handle feedback',
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