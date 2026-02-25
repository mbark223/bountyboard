import { Router, type Request, type Response } from "express";
import { authStorage } from "../replit_integrations/auth/storage";

const router = Router();

/**
 * TEST/DEV LOGIN ENDPOINT
 *
 * ⚠️ WARNING: This is for development/testing only!
 * Remove or disable this in production.
 *
 * Allows logging in with just an email address for testing purposes.
 */
router.post("/auth/test-login", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if we're in production
    if (process.env.NODE_ENV === "production" && process.env.ENABLE_TEST_LOGIN !== "true") {
      return res.status(403).json({
        error: "Test login is disabled in production"
      });
    }

    // Find user by email
    const user = await authStorage.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        error: "No user found with this email"
      });
    }

    // Create a test session by setting up passport user data
    // This mimics what the OAuth flow does
    const testUser = {
      claims: {
        sub: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
      access_token: "test_token",
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };

    // Establish session
    req.login(testUser, (err) => {
      if (err) {
        console.error("[Test Login] Error creating session:", err);
        return res.status(500).json({ error: "Failed to create session" });
      }

      console.log(`[Test Login] Session created for ${email} (${user.userType})`);

      // Return user data
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          role: user.role,
          isOnboarded: user.isOnboarded,
        },
      });
    });
  } catch (error) {
    console.error("[Test Login] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get current user endpoint (works with test login sessions)
 */
router.get("/auth/test-user", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = req.user as any;
    const userId = user.claims?.sub;

    if (!userId) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const userData = await authStorage.getUser(userId);

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(userData);
  } catch (error) {
    console.error("[Test Login] Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
