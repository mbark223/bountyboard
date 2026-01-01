import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { User } from '../../shared/models/auth';

// Mock user for development/demo purposes
// In production, this would check actual authentication
const MOCK_USER: User = {
  id: "demo-user-1",
  email: "admin@bountyboard.com",
  firstName: "Demo",
  lastName: "Admin",
  profileImageUrl: null,
  orgName: "BountyBoard Demo",
  orgSlug: "bountyboard-demo",
  orgDescription: "Demo organization for BountyBoard",
  orgWebsite: "https://bountyboard.com",
  orgLogoUrl: null,
  isOnboarded: true,
  role: "admin",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01")
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // For demo purposes, always return the mock user
    // In production, check session/JWT token here
    res.status(200).json(MOCK_USER);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}