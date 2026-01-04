// JavaScript version of submissions status endpoint
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
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    console.log('[API] Updating submission status:', { 
      submissionId, 
      status, 
      allowsResubmission, 
      reviewNotes,
      reviewNotesLength: reviewNotes ? reviewNotes.length : 0 
    });
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Build update query dynamically based on provided fields
    const updateFields = ['status = $2'];
    const values = [submissionId, status];
    let paramCount = 2;
    
    if (status === 'SELECTED') {
      paramCount++;
      updateFields.push(`selected_at = $${paramCount}`);
      values.push(new Date());
    }
    
    if (status === 'NOT_SELECTED' && allowsResubmission !== undefined) {
      paramCount++;
      updateFields.push(`allows_resubmission = $${paramCount}`);
      values.push(allowsResubmission ? 1 : 0);
    }
    
    if (reviewNotes !== undefined) {
      paramCount++;
      updateFields.push(`review_notes = $${paramCount}`);
      values.push(reviewNotes);
    }
    
    // Add updated_at only if we're updating other fields
    updateFields.push('updated_at = NOW()');
    
    const updateQuery = `
      UPDATE submissions 
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING 
        id,
        video_url,
        status,
        submitted_at,
        creator_id,
        creator_name,
        creator_email,
        creator_phone,
        creator_handle,
        creator_betting_account,
        message,
        video_file_name,
        video_mime_type,
        video_size_bytes,
        payout_status,
        payout_amount,
        payout_notes,
        reviewed_by,
        review_notes as "reviewNotes",
        selected_at,
        paid_at,
        has_feedback,
        parent_submission_id,
        submission_version,
        allows_resubmission as "allowsResubmission",
        brief_id
    `;
    
    const result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const row = result.rows[0];
    
    // Transform to match expected format
    const submission = {
      id: row.id,
      videoUrl: row.video_url,
      status: row.status,
      submittedAt: row.submitted_at,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      creatorEmail: row.creator_email,
      creatorPhone: row.creator_phone,
      creatorHandle: row.creator_handle,
      creatorBettingAccount: row.creator_betting_account,
      message: row.message,
      videoFileName: row.video_file_name,
      videoMimeType: row.video_mime_type,
      videoSizeBytes: row.video_size_bytes,
      payoutStatus: row.payout_status,
      payoutAmount: row.payout_amount,
      payoutNotes: row.payout_notes,
      reviewedBy: row.reviewed_by,
      reviewNotes: row.reviewNotes,
      selectedAt: row.selected_at,
      paidAt: row.paid_at,
      hasFeedback: row.has_feedback,
      parentSubmissionId: row.parent_submission_id,
      submissionVersion: row.submission_version,
      allowsResubmission: row.allowsResubmission,
      briefId: row.brief_id,
      creator: {
        id: row.creator_id,
        name: row.creator_name,
        email: row.creator_email,
        handle: row.creator_handle
      },
      video: {
        url: row.video_url,
        fileName: row.video_file_name,
        mimeType: row.video_mime_type,
        sizeBytes: row.video_size_bytes,
        duration: '0:30',
        thumbnail: '/placeholder-video.jpg'
      }
    };
    
    console.log('[API] Submission status updated:', submission.id);
    res.status(200).json(submission);
    
  } catch (error) {
    console.error('[API] Error updating submission status:', error);
    res.status(500).json({ 
      error: 'Failed to update submission status',
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