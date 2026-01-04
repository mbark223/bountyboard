// Simplified version of submissions status endpoint
import { Pool } from 'pg';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  const { id } = req.query;
  const submissionId = parseInt(id, 10);
  
  if (!id || isNaN(submissionId)) {
    return res.status(400).json({ error: 'Invalid submission ID' });
  }
  
  const { status, allowsResubmission, reviewNotes } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  let pool;
  
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('[API Simple] Updating submission:', { submissionId, status, reviewNotes });
    
    // First, just update the status
    let updateQuery = 'UPDATE submissions SET status = $2 WHERE id = $1';
    let values = [submissionId, status];
    
    // Try to update without additional fields first
    try {
      const result = await pool.query(updateQuery, values);
      console.log('[API Simple] Basic update result:', result.rowCount);
    } catch (basicError) {
      console.error('[API Simple] Basic update failed:', basicError);
      throw basicError;
    }
    
    // If review notes provided, try to update them separately
    if (reviewNotes && status === 'NOT_SELECTED') {
      try {
        // Check if review_notes column exists
        const checkColumn = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'submissions' AND column_name = 'review_notes'
        `);
        
        if (checkColumn.rows.length > 0) {
          await pool.query(
            'UPDATE submissions SET review_notes = $2 WHERE id = $1',
            [submissionId, reviewNotes]
          );
          console.log('[API Simple] Review notes updated');
        } else {
          console.log('[API Simple] review_notes column does not exist');
        }
      } catch (notesError) {
        console.error('[API Simple] Failed to update review notes:', notesError);
        // Continue anyway
      }
    }
    
    // Fetch the updated submission
    const selectQuery = `
      SELECT 
        s.*,
        b.title as brief_title,
        b.slug as brief_slug
      FROM submissions s
      LEFT JOIN briefs b ON s.brief_id = b.id
      WHERE s.id = $1
    `;
    
    const selectResult = await pool.query(selectQuery, [submissionId]);
    
    if (selectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found after update' });
    }
    
    const row = selectResult.rows[0];
    
    // Return simplified response
    const submission = {
      id: row.id,
      status: row.status,
      videoUrl: row.video_url || '',
      submittedAt: row.submitted_at,
      creatorName: row.creator_name || 'Unknown',
      creatorEmail: row.creator_email || '',
      creatorHandle: row.creator_handle || '@unknown',
      briefId: row.brief_id,
      reviewNotes: row.review_notes || null,
      allowsResubmission: row.allows_resubmission || 1,
      creator: {
        id: row.creator_id || null,
        name: row.creator_name || 'Unknown',
        email: row.creator_email || '',
        handle: row.creator_handle || '@unknown'
      },
      video: {
        url: row.video_url || '',
        fileName: row.video_file_name || 'video.mp4',
        mimeType: row.video_mime_type || 'video/mp4',
        sizeBytes: row.video_size_bytes || 0,
        duration: '0:30',
        thumbnail: '/placeholder-video.jpg'
      }
    };
    
    console.log('[API Simple] Returning updated submission:', submission.id);
    res.status(200).json(submission);
    
  } catch (error) {
    console.error('[API Simple] Error updating submission:', error);
    res.status(500).json({ 
      error: 'Failed to update submission status',
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