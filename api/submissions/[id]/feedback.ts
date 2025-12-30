import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';
import { insertFeedbackSchema } from '../../../shared/schema';

// Mock user for demo
const DEMO_USER = {
  id: "demo-user-1",
  name: "Demo Admin"
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const submissionId = parseInt(id as string, 10);
  
  if (isNaN(submissionId)) {
    return res.status(400).json({ error: "Invalid submission ID" });
  }

  if (req.method === 'GET') {
    try {
      const feedbackList = await storage.getFeedbackBySubmissionId(submissionId);
      res.status(200).json(feedbackList);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  } else if (req.method === 'POST') {
    try {
      const { comment, requiresAction } = req.body;
      
      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ error: "Comment is required" });
      }
      
      const validated = insertFeedbackSchema.parse({
        submissionId,
        authorId: DEMO_USER.id,
        authorName: DEMO_USER.name,
        comment: comment.trim(),
        requiresAction: requiresAction ? 1 : 0
      });
      
      const newFeedback = await storage.createFeedback(validated);
      res.status(201).json(newFeedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}