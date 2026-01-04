// CommonJS version of admin submissions endpoint
const { Pool } = require('pg');

module.exports = async function handler(req, res) {
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
  
  console.log('[Admin Submissions] Request received for briefId:', briefId);
  console.log('[Admin Submissions] DATABASE_URL configured:', !!process.env.DATABASE_URL);
  
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
        u.username as creator_username_from_user,
        u.email as creator_email_from_user,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name
      FROM submissions s
      LEFT JOIN users u ON s.creator_id = u.id
      WHERE s.brief_id = $1
      ORDER BY s.submitted_at DESC
    `, [briefId]);
    
    // Get brief info
    const briefResult = await pool.query(`
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
        id: brief.id,
        slug: brief.slug || `brief-${brief.id}`,
        title: brief.title,
        orgName: brief.user_org_name || brief.org_name,
        organization: {
          name: brief.user_org_name || brief.org_name,
          slug: brief.org_slug,
          logoUrl: brief.org_logo_url,
          website: brief.org_website,
          description: brief.org_description
        },
        rewardType: brief.reward_type,
        rewardAmount: brief.reward_amount,
        rewardCurrency: brief.reward_currency,
        rewardDescription: brief.reward_description,
        deadline: brief.deadline,
        status: brief.status,
        maxWinners: brief.max_winners,
        maxSubmissionsPerCreator: brief.max_submissions_per_creator
      },
      creator: {
        id: row.creator_id,
        username: row.creator_username_from_user || row.creator_handle,
        email: row.creator_email,
        firstName: row.creator_first_name,
        lastName: row.creator_last_name,
        name: row.creator_name || (row.creator_first_name && row.creator_last_name 
          ? `${row.creator_first_name} ${row.creator_last_name}`
          : row.creator_username_from_user || row.creator_handle || row.creator_email),
        handle: row.creator_handle || '@' + ((row.creator_email || 'user').split('@')[0])
      },
      video: {
        url: row.video_url,
        fileName: row.video_file_name,
        mimeType: row.video_mime_type,
        sizeBytes: row.video_size_bytes,
        duration: '0:30', // Mock duration for now
        thumbnail: '/placeholder-video.jpg' // Mock thumbnail for now
      }
    }));
    
    console.log(`Returning ${submissions.length} submissions for brief ${briefId}`);
    res.status(200).json(submissions);
    
  } catch (error) {
    console.error('Error fetching submissions:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      briefId,
      dbConfigured: !!process.env.DATABASE_URL,
      errorCode: error.code,
      errorName: error.constructor.name
    });
    
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