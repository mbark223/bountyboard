import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const feedbackId = parseInt(id as string, 10);
  
  if (isNaN(feedbackId)) {
    return res.status(400).json({ error: "Invalid feedback ID" });
  }

  if (req.method === 'PATCH') {
    try {
      const { comment } = req.body;
      
      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ error: "Comment is required" });
      }
      
      const updatedFeedback = await storage.updateFeedback(feedbackId, comment.trim());
      res.status(200).json(updatedFeedback);
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).json({ error: "Failed to update feedback" });
    }
  } else if (req.method === 'DELETE') {
    try {
      await storage.deleteFeedback(feedbackId);
      res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (error) {
      console.error("Error deleting feedback:", error);
      res.status(500).json({ error: "Failed to delete feedback" });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}