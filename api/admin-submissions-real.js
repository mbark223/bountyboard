// Real admin submissions endpoint that fetches from database
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
  
  const { briefId } = req.query;
  
  if (!briefId) {
    return res.status(400).json({ error: 'briefId is required' });
  }
  
  let pool;
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    console.log('[Admin Submissions Real] Fetching submissions for briefId:', briefId);
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const query = `
      SELECT 
        s.id,
        s.video_url,
        s.status,
        s.submitted_at,
        s.creator_id,
        s.creator_name,
        s.creator_email,
        s.creator_phone,
        s.creator_handle,
        s.creator_betting_account,
        s.message,
        s.video_file_name,
        s.video_mime_type,
        s.video_size_bytes,
        s.payout_status,
        s.payout_amount,
        s.payout_notes,
        s.reviewed_by,
        s.review_notes,
        s.selected_at,
        s.paid_at,
        s.has_feedback,
        s.parent_submission_id,
        s.submission_version,
        s.allows_resubmission,
        s.brief_id,
        b.title as brief_title,
        b.slug as brief_slug,
        b.reward_type,
        b.reward_amount,
        b.reward_currency,
        b.org_name as brief_org_name
      FROM submissions s
      LEFT JOIN briefs b ON s.brief_id = b.id
      WHERE s.brief_id = $1
      ORDER BY s.submitted_at DESC
    `;
    
    const result = await pool.query(query, [parseInt(briefId, 10)]);
    
    console.log('[Admin Submissions Real] Found submissions:', result.rows.length);
    
    // Transform to camelCase format
    const submissions = result.rows.map(row => ({
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
      reviewNotes: row.review_notes,
      selectedAt: row.selected_at,
      paidAt: row.paid_at,
      hasFeedback: row.has_feedback,
      parentSubmissionId: row.parent_submission_id,
      submissionVersion: row.submission_version,
      allowsResubmission: row.allows_resubmission,
      briefId: row.brief_id,
      brief: {
        id: row.brief_id,
        slug: row.brief_slug,
        title: row.brief_title,
        orgName: row.brief_org_name,
        rewardType: row.reward_type,
        rewardAmount: row.reward_amount,
        rewardCurrency: row.reward_currency
      },
      creator: {
        id: row.creator_id,
        name: row.creator_name,
        email: row.creator_email,
        handle: row.creator_handle || '@' + (row.creator_name || 'unknown').toLowerCase().replace(/\s+/g, '')
      },
      video: {
        url: row.video_url,
        fileName: row.video_file_name,
        mimeType: row.video_mime_type,
        sizeBytes: row.video_size_bytes,
        duration: '0:30', // Default duration
        thumbnail: '/placeholder-video.jpg'
      }
    }));
    
    res.status(200).json(submissions);
    
  } catch (error) {
    console.error('[Admin Submissions Real] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch submissions',
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