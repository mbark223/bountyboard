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
      
      const { status, allowsResubmission } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const selectedAt = status === "SELECTED" ? new Date() : undefined;
      const updatedSubmission = await storage.updateSubmissionStatus(
        submissionId, 
        status, 
        selectedAt,
        status === "NOT_SELECTED" ? allowsResubmission : undefined
      );
      res.status(200).json(updatedSubmission);
    } catch (error) {
      console.error("Error updating submission status:", error);
      res.status(500).json({ error: "Failed to update submission status" });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}