import { VercelRequest } from "@vercel/node";
import type { User } from "../../shared/schema";

// Mock authentication for demo purposes
// In production, this would validate session tokens, JWT, etc.
export async function getUser(req: VercelRequest): Promise<User | null> {
  // For demo, always return the mock admin user
  const MOCK_USER: User = {
    id: "demo-user-1",
    email: "admin@bountyboard.com",
    firstName: "Demo",
    lastName: "Admin",
    profileImageUrl: null,
    orgName: "BountyBoard Demo",
    orgSlug: "bountyboard-demo",
    orgLogoUrl: null,
    orgWebsite: null,
    orgDescription: null,
    isOnboarded: true,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return MOCK_USER;
}

export function requireAuth(user: User | null): asserts user is User {
  if (!user) {
    throw new Error("Unauthorized");
  }
}