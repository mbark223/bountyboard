import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';
import { insertPromptTemplateSchema } from '../../shared/schema';

// Mock user ID for demo - in production would get from session
const DEMO_USER_ID = "demo-user-1";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const templateId = parseInt(id as string, 10);
  
  if (isNaN(templateId)) {
    return res.status(400).json({ error: "Invalid template ID" });
  }

  if (req.method === 'GET') {
    try {
      const template = await storage.getTemplateById(templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      // In production, verify template belongs to user
      res.status(200).json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  } else if (req.method === 'PATCH') {
    try {
      const partialData = insertPromptTemplateSchema.partial().parse(req.body);
      const updatedTemplate = await storage.updateTemplate(templateId, partialData);
      res.status(200).json(updatedTemplate);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  } else if (req.method === 'DELETE') {
    try {
      await storage.deleteTemplate(templateId);
      res.status(200).json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}