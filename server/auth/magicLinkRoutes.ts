import { Router } from "express";
import { requestMagicLink, verifyMagicLink, getCurrentUser } from "./magicLinkAuth";

const router = Router();

// Request magic link
router.post("/auth/magic-link/request", requestMagicLink);

// Verify magic link
router.get("/auth/verify-magic-link", verifyMagicLink);

// Get current user (works for both Replit auth and magic link auth)
router.get("/auth/user", getCurrentUser);

export default router;