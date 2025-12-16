import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { z } from "zod";

const onboardingSchema = z.object({
  orgName: z.string().min(1, "Organization name is required"),
  orgSlug: z.string().min(1, "URL slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  orgWebsite: z.string().url().optional().or(z.literal("")),
  orgDescription: z.string().optional(),
});

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/onboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = onboardingSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { orgName, orgSlug, orgWebsite, orgDescription } = parsed.data;

      const existingSlug = await authStorage.getUserBySlug(orgSlug);
      if (existingSlug && existingSlug.id !== userId) {
        return res.status(400).json({ message: "This URL slug is already taken. Please choose another." });
      }

      const user = await authStorage.updateUserOrg(userId, {
        orgName,
        orgSlug,
        orgWebsite: orgWebsite || null,
        orgDescription: orgDescription || null,
        isOnboarded: true,
      });

      res.json(user);
    } catch (error) {
      console.error("Error during onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });
}
