import { VercelRequest, VercelResponse } from "@vercel/node";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 10000,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let client;

  try {
    client = await pool.connect();

    // Delete all briefs from BetMGM and FanDuel
    const deleteResult = await client.query(`
      DELETE FROM briefs
      WHERE org_name IN ('BetMGM', 'FanDuel')
      RETURNING id, title, org_name
    `);

    console.log(`[Cleanup] Deleted ${deleteResult.rows.length} competitor briefs`);

    return res.status(200).json({
      success: true,
      message: `Deleted ${deleteResult.rows.length} competitor briefs`,
      deletedBriefs: deleteResult.rows
    });

  } catch (error: any) {
    console.error("Error cleaning up briefs:", error);
    return res.status(500).json({
      error: "Failed to cleanup briefs",
      detail: error.message
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}
