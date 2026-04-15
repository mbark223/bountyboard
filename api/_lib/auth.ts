import { VercelRequest } from "@vercel/node";
import type { User, Influencer } from "../../shared/schema.js";
import { storage } from "./storage.js";

interface SessionData {
  passport?: {
    user?: {
      id?: string;
      claims?: {
        sub?: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        profile_image_url?: string;
      };
    };
  };
}

/**
 * Get authenticated user from session
 * Returns null if not authenticated
 */
export async function getUser(req: VercelRequest): Promise<User | null> {
  try {
    // Check for header-based auth first (used by client localStorage auth)
    const headerEmail = req.headers['x-user-email'] as string;
    if (headerEmail) {
      const user = await storage.getUserByEmail(decodeURIComponent(headerEmail));
      if (user) {
        return user;
      }
    }

    // Parse cookies
    const cookies = parseCookies(req.headers.cookie);

    // Check for simple cookie-based auth (used by test-login)
    const userEmail = cookies['user_email'];
    if (userEmail) {
      const user = await storage.getUserByEmail(decodeURIComponent(userEmail));
      if (user) {
        return user;
      }
    }

    // Fall back to session-based auth (used by OAuth/production)
    const sessionId = cookies['connect.sid'];

    if (!sessionId) {
      return null;
    }

    // Clean session ID (remove s: prefix and signature)
    const cleanSessionId = sessionId.startsWith('s:')
      ? sessionId.slice(2).split('.')[0]
      : sessionId.split('.')[0];

    // Get session from database
    const { db } = await import("./db");
    const { sessions } = await import("../../shared/models/auth");
    const { eq } = await import("drizzle-orm");

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sid, cleanSessionId));

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (new Date(session.expire) < new Date()) {
      return null;
    }

    // Parse session data
    const sessionData = session.sess as unknown as SessionData;
    const passportUser = sessionData?.passport?.user;

    if (!passportUser) {
      return null;
    }

    // Extract user ID from session
    // Handle both Replit auth (claims.sub) and magic link auth (id)
    const userId = passportUser.claims?.sub || passportUser.id;

    if (!userId) {
      return null;
    }

    // Get user from database
    const user = await storage.getUser(userId);

    return user || null;
  } catch (error) {
    console.error('[Auth] Error getting user:', error);
    return null;
  }
}

/**
 * Parse cookies from cookie header string
 */
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader
    .split(';')
    .map(c => c.trim())
    .reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);
}

/**
 * Require authentication
 * Throws error if user is not authenticated
 */
export function requireAuth(user: User | null): asserts user is User {
  if (!user) {
    throw new Error("Unauthorized");
  }
}

/**
 * Require admin role
 * Throws error if user is not admin
 */
export function requireAdmin(user: User | null): asserts user is User {
  requireAuth(user);
  if (user.userType !== 'admin' && user.role !== 'admin') {
    throw new Error("Forbidden: Admin access required");
  }
}

/**
 * Require influencer role
 * Throws error if user is not influencer
 */
export function requireInfluencer(user: User | null): asserts user is User {
  requireAuth(user);
  if (user.userType !== 'influencer') {
    throw new Error("Forbidden: Influencer access required");
  }
}

/**
 * Require approved influencer
 * Throws error if influencer is not approved
 */
export function requireApprovedInfluencer(
  user: User | null,
  influencer: Influencer | undefined
): asserts influencer is Influencer {
  requireInfluencer(user);
  if (!influencer || influencer.status !== 'approved') {
    throw new Error("Forbidden: Approved influencer status required");
  }
}