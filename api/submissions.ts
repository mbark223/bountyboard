import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/storage';
import { insertSubmissionSchema } from '../shared/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      console.log('[POST /api/submissions] Received request body:', JSON.stringify(req.body, null, 2));

      const validated = insertSubmissionSchema.parse(req.body);
      console.log('[POST /api/submissions] Validation passed, creating submission...');

      const newSubmission = await storage.createSubmission(validated);
      console.log('[POST /api/submissions] Submission created:', newSubmission.id);

      res.status(201).json(newSubmission);
    } catch (error: any) {
      console.error('[POST /api/submissions] Error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }

      res.status(500).json({
        error: 'Failed to create submission',
        message: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}