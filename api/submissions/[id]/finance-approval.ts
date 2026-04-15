import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage.js';

/**
 * Finance Approval Endpoint
 *
 * POST /api/submissions/[id]/finance-approval
 * Updates the finance approval status for a submission
 *
 * Requires admin authentication
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

  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const submissionId = parseInt(id as string, 10);
      if (isNaN(submissionId)) {
        return res.status(400).json({ error: "Invalid submission ID" });
      }

      const { status, notes, userId } = req.body;

      // Validate required fields
      if (!status || !userId) {
        return res.status(400).json({
          error: "Missing required fields: status and userId are required"
        });
      }

      // Validate status value
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          error: "Invalid status. Must be 'approved' or 'rejected'"
        });
      }

      // Check if submission exists and is in SELECTED state
      const submission = await storage.getSubmissionById(submissionId);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      if (submission.status !== "SELECTED") {
        return res.status(400).json({
          error: "Finance approval can only be applied to selected submissions"
        });
      }

      // Update finance approval status
      const updatedSubmission = await storage.updateSubmissionFinanceApproval(
        submissionId,
        status,
        userId,
        notes
      );

      console.log(`[Finance Approval] Submission ${submissionId} ${status} by user ${userId}`);

      res.status(200).json(updatedSubmission);
    } catch (error) {
      console.error("Error updating finance approval:", error);
      res.status(500).json({
        error: "Failed to update finance approval",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
