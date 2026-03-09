// Protected endpoint - submission creation with authentication
import { getUser } from './_lib/auth.js';
import { storage } from './_lib/storage.js';

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

  try {
    // Check authentication
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only approved influencers can submit
    if (user.userType !== 'influencer') {
      return res.status(403).json({ error: 'Only influencers can submit content' });
    }

    const influencer = await storage.getInfluencerByEmail(user.email);

    if (!influencer) {
      console.log(`[Auth] Influencer ${user.email} - no influencer record found`);
      return res.status(403).json({ error: 'Influencer profile not found' });
    }

    if (influencer.status !== 'approved') {
      console.log(`[Auth] Influencer ${user.email} - status: ${influencer.status}`);
      return res.status(403).json({
        error: 'Account pending approval',
        status: influencer.status
      });
    }

    const submission = req.body;

    // Validate required fields
    if (!submission.briefId || !submission.videoUrl || !submission.videoFileName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['briefId', 'videoUrl', 'videoFileName']
      });
    }

    // Check if brief exists
    const brief = await storage.getBriefById(submission.briefId);
    if (!brief) {
      return res.status(400).json({ error: 'Brief not found' });
    }

    // Check if influencer is assigned to this brief
    const assignment = await storage.getBriefAssignment(submission.briefId, influencer.id);

    if (!assignment) {
      console.log(`[Auth] Influencer ${user.email} - not assigned to brief ${brief.title}`);
      return res.status(403).json({ error: 'You are not assigned to this brief' });
    }

    // Count existing submissions from this creator
    const submissionCount = await storage.countSubmissionsByCreatorEmail(
      submission.briefId,
      influencer.email
    );

    // Check submission limit
    const maxSubmissions = brief.maxSubmissionsPerCreator || 1;

    if (submissionCount >= maxSubmissions) {
      return res.status(400).json({
        error: 'Submission limit reached',
        message: `You have already submitted the maximum of ${maxSubmissions} videos for this brief`
      });
    }

    // Create submission with authenticated user's information
    const newSubmission = await storage.createSubmission({
      briefId: submission.briefId,
      creatorId: user.id, // Link to authenticated user
      creatorName: `${influencer.firstName} ${influencer.lastName}`,
      creatorEmail: influencer.email,
      creatorPhone: influencer.phone,
      creatorHandle: influencer.instagramHandle,
      creatorBettingAccount: submission.creatorBettingAccount || null,
      message: submission.message || null,
      videoUrl: submission.videoUrl,
      videoFileName: submission.videoFileName,
      videoMimeType: submission.videoMimeType || 'video/mp4',
      videoSizeBytes: submission.videoSizeBytes || 0,
      status: 'RECEIVED',
      payoutStatus: 'NOT_APPLICABLE'
    });

    console.log(`[Auth] Influencer ${user.email} - created submission ${newSubmission.id} for brief ${brief.title}`);
    res.status(201).json(newSubmission);

  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({
      error: 'Failed to create submission',
      message: error.message
    });
  }
}
