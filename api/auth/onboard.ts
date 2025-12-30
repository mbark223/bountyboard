import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Mock implementation - in production would update user in database
    const { orgName, orgSlug, orgDescription, orgWebsite, orgLogoUrl } = req.body;
    
    // Return success with updated user data
    res.status(200).json({
      success: true,
      user: {
        id: "demo-user-1",
        email: "admin@bountyboard.com",
        firstName: "Demo",
        lastName: "Admin",
        orgName: orgName || "BountyBoard Demo",
        orgSlug: orgSlug || "bountyboard-demo",
        orgDescription: orgDescription || "Demo organization for BountyBoard",
        orgWebsite: orgWebsite || "https://bountyboard.com",
        orgLogoUrl: orgLogoUrl || null,
        isOnboarded: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date()
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}