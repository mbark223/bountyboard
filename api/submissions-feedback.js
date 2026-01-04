// JavaScript version of submissions feedback endpoint
import { Pool } from 'pg';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { id } = req.query;
  const submissionId = parseInt(id, 10);
  
  if (!id || isNaN(submissionId)) {
    return res.status(400).json({ error: 'Invalid submission ID' });
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
      console.log('[API] Fetching feedback for submission:', submissionId);
      
      const query = `
        SELECT 
          id,
          submission_id as "submissionId",
          author_id as "authorId",
          author_name as "authorName",
          comment,
          requires_action as "requiresAction",
          created_at as "createdAt"
        FROM feedback
        WHERE submission_id = $1
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [submissionId]);
      console.log('[API] Found feedback:', result.rows.length);
      
      res.status(200).json(result.rows);
      
    } else if (req.method === 'POST') {
      const { comment, requiresAction } = req.body;
      
      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ error: 'Comment is required' });
      }
      
      // For demo purposes, using a hardcoded user
      const DEMO_USER = {
        id: 'demo-user-1',
        name: 'Demo Admin'
      };
      
      console.log('[API] Creating feedback for submission:', submissionId);
      
      const insertQuery = `
        INSERT INTO feedback (
          submission_id, 
          author_id, 
          author_name, 
          comment, 
          requires_action,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING 
          id,
          submission_id as "submissionId",
          author_id as "authorId",
          author_name as "authorName",
          comment,
          requires_action as "requiresAction",
          created_at as "createdAt"
      `;
      
      const result = await pool.query(insertQuery, [
        submissionId,
        DEMO_USER.id,
        DEMO_USER.name,
        comment.trim(),
        requiresAction ? 1 : 0
      ]);
      
      console.log('[API] Feedback created:', result.rows[0].id);
      res.status(201).json(result.rows[0]);
      
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
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