import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    message: "API is working",
    DATABASE_URL_exists: \!\!process.env.DATABASE_URL,
    timestamp: new Date().toISOString()
  });
}
