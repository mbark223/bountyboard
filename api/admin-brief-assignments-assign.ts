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
    const { briefId, influencerId, assignedBy } = req.body;

    if (!briefId || !influencerId) {
      return res.status(400).json({ error: "Missing briefId or influencerId" });
    }

    client = await pool.connect();

    // Check if assignment already exists
    const checkQuery = `
      SELECT id FROM brief_assignments
      WHERE brief_id = $1 AND influencer_id = $2
    `;
    const checkResult = await client.query(checkQuery, [briefId, influencerId]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: "Brief already assigned to this talent" });
    }

    // Create assignment
    const insertQuery = `
      INSERT INTO brief_assignments (brief_id, influencer_id, assigned_by, status)
      VALUES ($1, $2, $3, 'assigned')
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      briefId,
      influencerId,
      assignedBy || 'admin'
    ]);

    return res.status(200).json({
      success: true,
      message: "Brief assigned successfully",
      assignment: result.rows[0]
    });

  } catch (error: any) {
    console.error("Error assigning brief:", error);
    return res.status(500).json({
      error: "Failed to assign brief",
      detail: error.message
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}
