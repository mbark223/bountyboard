import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.json({
    status: "ok",
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    }
  });
}