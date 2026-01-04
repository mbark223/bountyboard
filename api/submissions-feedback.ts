import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { submissionId } = req.query;
  const { status, feedback } = req.body;
  
  if (!submissionId) {
    res.status(400).json({ error: 'submissionId is required' });
    return;
  }
  
  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400).json({ error: 'status must be either APPROVED or REJECTED' });
    return;
  }
  
  if (status === 'REJECTED' && !feedback) {
    res.status(400).json({ error: 'feedback is required when rejecting a submission' });
    return;
  }

  try {
    // Update submission
    const result = await query(`
      UPDATE submissions 
      SET status = $1, feedback = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [status, feedback || null, submissionId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }
    
    const updatedSubmission = result.rows[0];
    
    // Get creator info for the response
    const creatorResult = await query(`
      SELECT username, email, first_name, last_name 
      FROM users 
      WHERE id = $1
    `, [updatedSubmission.user_id]);
    
    const creator = creatorResult.rows[0] || {};
    
    // Get brief info
    const briefResult = await query(`
      SELECT * FROM briefs WHERE id = $1
    `, [updatedSubmission.brief_id]);
    
    const brief = briefResult.rows[0] || {};
    
    // Return the updated submission in the expected format
    const response = {
      id: updatedSubmission.id,
      videoUrl: updatedSubmission.video_url,
      status: updatedSubmission.status,
      submittedAt: updatedSubmission.submitted_at,
      feedback: updatedSubmission.feedback,
      creatorId: updatedSubmission.user_id,
      briefId: updatedSubmission.brief_id,
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
        id: updatedSubmission.user_id,
        username: creator.username,
        email: creator.email,
        firstName: creator.first_name,
        lastName: creator.last_name,
        name: creator.first_name && creator.last_name 
          ? `${creator.first_name} ${creator.last_name}`
          : creator.username || creator.email
      }
    };
    
    console.log(`Updated submission ${submissionId} with status ${status}`);
    res.status(200).json(response);
    
  } catch (error: any) {
    console.error('Error updating submission:', error);
    res.status(500).json({ 
      error: 'Failed to update submission',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}