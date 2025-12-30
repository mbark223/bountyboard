import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  
  if (req.method === 'PATCH') {
    try {
      const submissionId = parseInt(id as string, 10);
      if (isNaN(submissionId)) {
        return res.status(400).json({ error: "Invalid submission ID" });
      }
      
      const { payoutStatus, notes } = req.body;
      if (!payoutStatus) {
        return res.status(400).json({ error: "Payout status is required" });
      }
      
      const paidAt = payoutStatus === "COMPLETED" ? new Date() : undefined;
      const updatedSubmission = await storage.updateSubmissionPayout(submissionId, payoutStatus, paidAt, notes);
      res.status(200).json(updatedSubmission);
    } catch (error) {
      console.error("Error updating payout:", error);
      res.status(500).json({ error: "Failed to update payout" });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}