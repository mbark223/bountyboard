// JavaScript version of submissions creation endpoint
import { Pool } from 'pg';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    
    const submission = req.body;
    
    // Validate required fields
    if (!submission.briefId || !submission.creatorName || !submission.creatorEmail || 
        !submission.creatorHandle || !submission.videoUrl || !submission.videoFileName) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['briefId', 'creatorName', 'creatorEmail', 'creatorHandle', 'videoUrl', 'videoFileName']
      });
    }
    
    // Check if brief exists
    const briefCheck = await pool.query('SELECT id FROM briefs WHERE id = $1', [submission.briefId]);
    if (briefCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Brief not found' });
    }
    
    // Count existing submissions from this creator
    const countResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM submissions 
      WHERE brief_id = $1 
      AND LOWER(creator_email) = LOWER($2)
    `, [submission.briefId, submission.creatorEmail]);
    
    const submissionCount = parseInt(countResult.rows[0].count);
    
    // Check submission limit
    const briefResult = await pool.query(
      'SELECT max_submissions_per_creator FROM briefs WHERE id = $1',
      [submission.briefId]
    );
    
    const maxSubmissions = briefResult.rows[0]?.max_submissions_per_creator || 1;
    
    if (submissionCount >= maxSubmissions) {
      return res.status(400).json({ 
        error: 'Submission limit reached',
        message: `You have already submitted the maximum of ${maxSubmissions} videos for this brief`
      });
    }
    
    // Insert submission
    const insertResult = await pool.query(`
      INSERT INTO submissions (
        brief_id,
        creator_id,
        creator_name,
        creator_email,
        creator_phone,
        creator_handle,
        creator_betting_account,
        message,
        video_url,
        video_file_name,
        video_mime_type,
        video_size_bytes,
        status,
        payout_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      submission.briefId,
      submission.creatorId || null,
      submission.creatorName,
      submission.creatorEmail,
      submission.creatorPhone || null,
      submission.creatorHandle,
      submission.creatorBettingAccount || null,
      submission.message || null,
      submission.videoUrl,
      submission.videoFileName,
      submission.videoMimeType || 'video/mp4',
      submission.videoSizeBytes || 0,
      'RECEIVED',
      'NOT_APPLICABLE'
    ]);
    
    const newSubmission = insertResult.rows[0];
    
    // Transform to camelCase
    const response = {
      id: newSubmission.id,
      briefId: newSubmission.brief_id,
      creatorId: newSubmission.creator_id,
      creatorName: newSubmission.creator_name,
      creatorEmail: newSubmission.creator_email,
      creatorPhone: newSubmission.creator_phone,
      creatorHandle: newSubmission.creator_handle,
      creatorBettingAccount: newSubmission.creator_betting_account,
      message: newSubmission.message,
      videoUrl: newSubmission.video_url,
      videoFileName: newSubmission.video_file_name,
      videoMimeType: newSubmission.video_mime_type,
      videoSizeBytes: newSubmission.video_size_bytes,
      status: newSubmission.status,
      payoutStatus: newSubmission.payout_status,
      submittedAt: newSubmission.submitted_at
    };
    
    console.log('Created submission:', response.id);
    res.status(201).json(response);
    
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ 
      error: 'Failed to create submission',
      message: error.message
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}