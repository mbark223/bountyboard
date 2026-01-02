import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users, magicLinks, type User } from "@shared/models/auth";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { sendEmail } from "../../api/_lib/email";
import passport from "passport";

/**
 * Generate a secure random token
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate magic link email HTML
 */
function generateMagicLinkEmail(magicLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to BountyBoard</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #7B5CFA;">BountyBoard</h1>
                            <p style="margin: 10px 0 0; font-size: 16px; color: #6b7280;">Sign in to your account</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 40px 30px;">
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                                Click the button below to securely sign in to your BountyBoard account:
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${magicLink}" style="display: inline-block; padding: 14px 32px; background-color: #7B5CFA; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">Sign In</a>
                            </div>
                            
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="color: #7B5CFA; font-size: 14px; line-height: 1.5; margin: 5px 0 20px; word-break: break-all;">
                                ${magicLink}
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                                This link expires in 15 minutes for security reasons. If you didn't request this email, you can safely ignore it.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} BountyBoard. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
}

/**
 * Request a magic link
 */
export async function requestMagicLink(req: Request, res: Response) {
  try {
    const { email, userType = "creator" } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    let [user] = await db.select().from(users).where(eq(users.email, email));

    // If user doesn't exist, create one (registration)
    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          email,
          userType,
          emailVerified: false,
        })
        .returning();
    }

    // Generate magic link token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store magic link
    await db.insert(magicLinks).values({
      email,
      token,
      userId: user.id,
      expiresAt,
    });

    // Construct magic link URL
    const protocol = req.protocol;
    const host = req.get("host");
    const magicLink = `${protocol}://${host}/auth/verify-magic-link?token=${token}`;

    // Send email
    await sendEmail({
      to: email,
      subject: "Sign in to BountyBoard",
      html: generateMagicLinkEmail(magicLink),
    });

    res.json({
      message: "Magic link sent! Check your email to sign in.",
      email,
    });
  } catch (error) {
    console.error("Magic link request error:", error);
    res.status(500).json({ error: "Failed to send magic link" });
  }
}

/**
 * Verify a magic link and log the user in
 */
export async function verifyMagicLink(req: Request, res: Response) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Invalid token" });
    }

    // Find valid magic link
    const [magicLink] = await db
      .select()
      .from(magicLinks)
      .where(
        and(
          eq(magicLinks.token, token),
          gt(magicLinks.expiresAt, new Date()),
          eq(magicLinks.usedAt, null)
        )
      );

    if (!magicLink) {
      return res.status(400).json({ error: "Invalid or expired link" });
    }

    // Mark as used
    await db
      .update(magicLinks)
      .set({ usedAt: new Date() })
      .where(eq(magicLinks.id, magicLink.id));

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, magicLink.userId!));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user's last login and email verification status
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        emailVerified: true,
      })
      .where(eq(users.id, user.id));

    // Create a user object compatible with passport session
    const sessionUser = {
      id: user.id,
      email: user.email,
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        profile_image_url: user.profileImageUrl,
      }
    };

    // Log the user in by setting session
    req.login(sessionUser, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }
      
      // Redirect based on user type
      const redirectPath = user.userType === "influencer" ? "/portal" : "/";
      res.redirect(redirectPath);
    });
  } catch (error) {
    console.error("Magic link verification error:", error);
    res.status(500).json({ error: "Failed to verify magic link" });
  }
}

/**
 * Middleware to check if user is authenticated via magic link
 */
export const isMagicLinkAuthenticated: typeof NextFunction = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};

/**
 * Get current authenticated user
 */
export async function getCurrentUser(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Handle both Replit auth (has claims.sub) and magic link auth (has id)
  const userSession = req.user as any;
  const userId = userSession.claims?.sub || userSession.id;
  
  if (!userId) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
}