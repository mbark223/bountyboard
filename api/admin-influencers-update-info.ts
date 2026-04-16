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
    const {
      influencerId,
      firstName,
      lastName,
      email,
      phone,
      instagramHandle,
      instagramFollowers,
      tiktokHandle
    } = req.body;

    if (!influencerId) {
      return res.status(400).json({ error: "Missing influencerId" });
    }

    client = await pool.connect();

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (instagramHandle !== undefined) {
      updates.push(`instagram_handle = $${paramCount++}`);
      values.push(instagramHandle);
    }
    if (instagramFollowers !== undefined) {
      updates.push(`instagram_followers = $${paramCount++}`);
      values.push(instagramFollowers);
    }
    if (tiktokHandle !== undefined) {
      updates.push(`tiktok_handle = $${paramCount++}`);
      values.push(tiktokHandle);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(influencerId);

    const updateQuery = `
      UPDATE influencers
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await client.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Influencer not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Influencer updated successfully",
      influencer: result.rows[0]
    });

  } catch (error: any) {
    console.error("Error updating influencer info:", error);
    return res.status(500).json({
      error: "Failed to update influencer info",
      detail: error.message
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}
