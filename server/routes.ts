import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBriefSchema, insertSubmissionSchema } from "@shared/schema";

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
      const { status } = req.body;
      
      if (!["RECEIVED", "IN_REVIEW", "SELECTED", "NOT_SELECTED"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const selectedAt = status === "SELECTED" ? new Date() : undefined;
      const submission = await storage.updateSubmissionStatus(id, status, selectedAt);
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

  return httpServer;
}
