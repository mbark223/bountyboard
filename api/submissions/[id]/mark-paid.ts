import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';

/**
 * Mark submission as paid
 * POST /api/submissions/:id/mark-paid
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-email');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const submissionId = parseInt(id as string);

    if (isNaN(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    // Get the submission to verify it exists and is selected
    const submission = await storage.getSubmissionById(submissionId);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.status !== 'SELECTED') {
      return res.status(400).json({ error: 'Only selected submissions can be marked as paid' });
    }

    // Update payout status to PAID
    const updatedSubmission = await storage.updateSubmissionPayout(
      submissionId,
      'PAID',
      new Date(),
      'Payment processed'
    );

    console.log(`[Mark Paid] Submission ${submissionId} marked as paid`);

    return res.status(200).json(updatedSubmission);

  } catch (error: any) {
    console.error('[Mark Paid] Error:', error);
    return res.status(500).json({
      error: 'Failed to mark submission as paid',
      message: error.message
    });
  }
}
