import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBriefSchema, insertSubmissionSchema, insertPromptTemplateSchema, insertFeedbackSchema } from "@shared/schema";
import { isAuthenticated } from "./replit_integrations/auth";

async function fetchBrandMetadata(url: string): Promise<{
  title?: string;
  description?: string;
  logo?: string;
  favicon?: string;
  ogImage?: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BountyBoard/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) throw new Error('Failed to fetch URL');
    
    const html = await response.text();
    
    const getMetaContent = (name: string): string | undefined => {
      const patterns = [
        new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']${name}["']`, 'i'),
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
      }
      return undefined;
    };
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = getMetaContent('og:site_name') || getMetaContent('og:title') || (titleMatch ? titleMatch[1].trim() : undefined);
    
    const description = getMetaContent('og:description') || getMetaContent('description');
    
    const ogImage = getMetaContent('og:image');
    
    const baseUrl = new URL(url);
    const faviconPatterns = [
      /<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i,
    ];
    
    let favicon: string | undefined;
    for (const pattern of faviconPatterns) {
      const match = html.match(pattern);
      if (match) {
        favicon = match[1].startsWith('http') ? match[1] : new URL(match[1], baseUrl.origin).href;
        break;
      }
    }
    if (!favicon) {
      favicon = `${baseUrl.origin}/favicon.ico`;
    }
    
    const logo = ogImage?.startsWith('http') ? ogImage : ogImage ? new URL(ogImage, baseUrl.origin).href : undefined;
    
    return { title, description, logo, favicon, ogImage: logo };
  } catch (error) {
    console.error('Error fetching brand metadata:', error);
    throw error;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // GET /api/briefs - Get all published briefs
  app.get("/api/briefs", async (req, res) => {
    try {
      const allBriefs = await storage.getAllPublishedBriefs();
      res.json(allBriefs);
    } catch (error) {
      console.error("Error fetching briefs:", error);
      res.status(500).json({ error: "Failed to fetch briefs" });
    }
  });

  // GET /api/admin/briefs - Get all briefs for admin
  app.get("/api/admin/briefs", async (req, res) => {
    try {
      // For admin, we want to see all briefs, not just published ones
      // In a real app, you'd check admin permissions here
      const allBriefs = await storage.getAllBriefs();
      
      // Add submission count to each brief
      const briefsWithCounts = await Promise.all(
        allBriefs.map(async (brief) => {
          const submissions = await storage.getSubmissionsByBriefId(brief.id);
          return {
            ...brief,
            submissionCount: submissions.length
          };
        })
      );
      
      res.json(briefsWithCounts);
    } catch (error) {
      console.error("Error fetching admin briefs:", error);
      res.status(500).json({ error: "Failed to fetch briefs" });
    }
  });

  // GET /api/briefs/:slug - Get a single brief by slug
  app.get("/api/briefs/:slug", async (req, res) => {
    try {
      const brief = await storage.getBriefBySlug(req.params.slug);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }
      res.json(brief);
    } catch (error) {
      console.error("Error fetching brief:", error);
      res.status(500).json({ error: "Failed to fetch brief" });
    }
  });

  // GET /api/briefs/by-slug/:slug - Alternative route for getting brief by slug
  app.get("/api/briefs/by-slug/:slug", async (req, res) => {
    try {
      const brief = await storage.getBriefBySlug(req.params.slug);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }
      res.json(brief);
    } catch (error) {
      console.error("Error fetching brief by slug:", error);
      res.status(500).json({ error: "Failed to fetch brief" });
    }
  });

  // POST /api/briefs - Create a new brief
  app.post("/api/briefs", async (req, res) => {
    try {
      const validatedData = insertBriefSchema.parse(req.body);
      const brief = await storage.createBrief(validatedData);
      res.status(201).json(brief);
    } catch (error: any) {
      console.error("Error creating brief:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create brief" });
    }
  });

  // GET /api/briefs/id/:id - Get a single brief by ID
  app.get("/api/briefs/id/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const brief = await storage.getBriefById(id);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }
      res.json(brief);
    } catch (error) {
      console.error("Error fetching brief:", error);
      res.status(500).json({ error: "Failed to fetch brief" });
    }
  });

  // GET /api/briefs/:id/submissions - Get all submissions for a brief
  app.get("/api/briefs/:id/submissions", async (req, res) => {
    try {
      const briefId = parseInt(req.params.id);
      const submissionList = await storage.getSubmissionsByBriefId(briefId);
      res.json(submissionList);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  // POST /api/submissions - Create a new submission
  app.post("/api/submissions", async (req, res) => {
    try {
      const validatedData = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error: any) {
      console.error("Error creating submission:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create submission" });
    }
  });

  // PATCH /api/submissions/:id/status - Update submission status
  app.patch("/api/submissions/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, allowsResubmission, reviewNotes } = req.body;
      
      if (!["RECEIVED", "IN_REVIEW", "SELECTED", "NOT_SELECTED"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const selectedAt = status === "SELECTED" ? new Date() : undefined;
      const submission = await storage.updateSubmissionStatus(id, status, selectedAt, allowsResubmission, reviewNotes);
      res.json(submission);
    } catch (error) {
      console.error("Error updating submission status:", error);
      res.status(500).json({ error: "Failed to update submission status" });
    }
  });

  // PATCH /api/submissions/:id/payout - Update payout status
  app.patch("/api/submissions/:id/payout", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { payoutStatus, notes } = req.body;
      
      if (!["NOT_APPLICABLE", "PENDING", "PAID"].includes(payoutStatus)) {
        return res.status(400).json({ error: "Invalid payout status" });
      }

      const paidAt = payoutStatus === "PAID" ? new Date() : undefined;
      const submission = await storage.updateSubmissionPayout(id, payoutStatus, paidAt, notes);
      res.json(submission);
    } catch (error) {
      console.error("Error updating payout:", error);
      res.status(500).json({ error: "Failed to update payout" });
    }
  });

  // GET /api/submissions/:id/feedback - Get feedback for a submission
  app.get("/api/submissions/:id/feedback", async (req, res) => {
    try {
      const submissionId = parseInt(req.params.id);
      const feedbackList = await storage.getFeedbackBySubmissionId(submissionId);
      res.json(feedbackList);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // POST /api/submissions/:id/feedback - Create feedback for a submission
  app.post("/api/submissions/:id/feedback", async (req, res) => {
    try {
      const submissionId = parseInt(req.params.id);
      const { comment, requiresAction } = req.body;
      
      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ error: "Comment is required" });
      }
      
      const feedback = await storage.createFeedback({
        submissionId,
        authorId: "demo-user-1", // For demo purposes
        authorName: "Demo Admin",
        comment: comment.trim(),
        requiresAction: requiresAction ? 1 : 0
      });
      
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  });

  // PATCH /api/feedback/:id - Update feedback
  app.patch("/api/feedback/:id", async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      const { comment } = req.body;
      
      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ error: "Comment is required" });
      }
      
      const feedback = await storage.updateFeedback(feedbackId, comment.trim());
      res.json(feedback);
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).json({ error: "Failed to update feedback" });
    }
  });

  // DELETE /api/feedback/:id - Delete feedback
  app.delete("/api/feedback/:id", async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      await storage.deleteFeedback(feedbackId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      res.status(500).json({ error: "Failed to delete feedback" });
    }
  });

  // POST /api/fetch-brand - Fetch brand metadata from URL
  app.post("/api/fetch-brand", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "URL is required" });
      }
      
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      
      try {
        new URL(normalizedUrl);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      
      const metadata = await fetchBrandMetadata(normalizedUrl);
      res.json(metadata);
    } catch (error) {
      console.error("Error fetching brand metadata:", error);
      res.status(500).json({ error: "Failed to fetch brand information from this URL" });
    }
  });

  // GET /api/templates - Get all templates for current user
  app.get("/api/templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const templates = await storage.getTemplatesByOwnerId(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // GET /api/templates/:id - Get a single template
  app.get("/api/templates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplateById(id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      if (template.ownerId !== req.user.claims.sub) {
        return res.status(403).json({ error: "Not authorized" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  // POST /api/templates - Create a new template
  app.post("/api/templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPromptTemplateSchema.parse({
        ...req.body,
        ownerId: userId,
      });
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch (error: any) {
      console.error("Error creating template:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  // PATCH /api/templates/:id - Update a template
  app.patch("/api/templates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplateById(id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      if (template.ownerId !== req.user.claims.sub) {
        return res.status(403).json({ error: "Not authorized" });
      }
      const updated = await storage.updateTemplate(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  // DELETE /api/templates/:id - Delete a template
  app.delete("/api/templates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplateById(id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      if (template.ownerId !== req.user.claims.sub) {
        return res.status(403).json({ error: "Not authorized" });
      }
      await storage.deleteTemplate(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // POST /api/videos/upload-url - Generate upload URL for video
  app.post("/api/videos/upload-url", async (req, res) => {
    try {
      const { fileName, fileType, fileSizeBytes, briefId, creatorEmail } = req.body;
      
      // Validate input
      if (!fileName || !fileType || !fileSizeBytes || !briefId || !creatorEmail) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      if (!fileType.startsWith("video/")) {
        return res.status(400).json({ error: "File must be a video" });
      }
      
      if (fileSizeBytes > 500 * 1024 * 1024) { // 500MB limit
        return res.status(400).json({ error: "File size exceeds 500MB limit" });
      }
      
      // Verify brief exists
      const brief = await storage.getBriefById(briefId);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }
      
      // Generate mock upload URL (in production, use real storage)
      const timestamp = Date.now();
      const videoKey = `briefs/${briefId}/submissions/${timestamp}-${fileName}`;
      const uploadToken = Math.random().toString(36).substring(7);
      const uploadUrl = `http://localhost:3000/api/videos/mock-upload?token=${uploadToken}&key=${encodeURIComponent(videoKey)}`;
      
      res.json({
        uploadUrl,
        videoKey,
        publicUrl: `http://localhost:3000/api/videos/${videoKey}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // POST /api/videos/mock-upload - Mock video upload endpoint
  app.post("/api/videos/mock-upload", async (req, res) => {
    try {
      // Simulate upload (in production, handle actual file upload)
      console.log("Mock video upload received");
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      res.json({
        success: true,
        message: "Video uploaded successfully (mock)",
      });
    } catch (error) {
      console.error("Error in mock upload:", error);
      res.status(500).json({ error: "Failed to upload video" });
    }
  });

  // PUT /api/videos/mock-upload - Also support PUT method
  app.put("/api/videos/mock-upload", async (req, res) => {
    try {
      console.log("Mock video upload received (PUT)");
      await new Promise(resolve => setTimeout(resolve, 100));
      res.json({
        success: true,
        message: "Video uploaded successfully (mock)",
      });
    } catch (error) {
      console.error("Error in mock upload:", error);
      res.status(500).json({ error: "Failed to upload video" });
    }
  });

  return httpServer;
}
