import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';
import { insertPromptTemplateSchema } from '../../shared/schema';

// Mock user ID for demo - in production would get from session
const DEMO_USER_ID = "demo-user-1";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const templates = await storage.getTemplatesByOwnerId(DEMO_USER_ID);
      res.status(200).json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  } else if (req.method === 'POST') {
    try {
      const validated = insertPromptTemplateSchema.parse({
        ...req.body,
        ownerId: DEMO_USER_ID
      });
      const newTemplate = await storage.createTemplate(validated);
      res.status(201).json(newTemplate);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}