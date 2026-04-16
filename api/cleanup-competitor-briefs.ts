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

    // Update BetMGM briefs to Hard Rock Bet
    const updateBetMGM = await client.query(`
      UPDATE briefs
      SET
        org_name = 'Hard Rock Bet',
        state = 'Florida',
        title = CASE
          WHEN title LIKE '%Puff%' THEN 'Casino Legends Series'
          ELSE title
        END,
        slug = CASE
          WHEN slug LIKE '%puff%' THEN 'casino-legends-series'
          ELSE slug
        END
      WHERE org_name = 'BetMGM'
      RETURNING id, title
    `);

    // Update FanDuel briefs to Hard Rock Bet
    const updateFanDuel = await client.query(`
      UPDATE briefs
      SET
        org_name = 'Hard Rock Bet',
        state = 'Florida'
      WHERE org_name = 'FanDuel'
      RETURNING id, title
    `);

    const totalUpdated = updateBetMGM.rows.length + updateFanDuel.rows.length;
    console.log(`[Cleanup] Updated ${totalUpdated} competitor briefs to Hard Rock Bet`);

    return res.status(200).json({
      success: true,
      message: `Updated ${totalUpdated} briefs to Hard Rock Bet`,
      updatedBriefs: [...updateBetMGM.rows, ...updateFanDuel.rows]
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
