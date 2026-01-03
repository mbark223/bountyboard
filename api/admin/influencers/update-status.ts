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
    const { influencerId, status, notes } = req.body;
    
    // Validate input
    if (!influencerId || !status) {
      return res.status(400).json({ error: "Missing influencerId or status" });
    }
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'approved', 'rejected', or 'pending'" });
    }
    
    // Get a client from the pool
    client = await pool.connect();
    
    // Update influencer status and notes
    let updateQuery;
    let updateParams;
    
    if (status === 'approved') {
      updateQuery = 'UPDATE influencers SET status = $1, admin_notes = $2, approved_at = NOW() WHERE id = $3 RETURNING *';
      updateParams = [status, notes, influencerId];
    } else if (status === 'rejected') {
      updateQuery = 'UPDATE influencers SET status = $1, rejection_reason = $2, rejected_at = NOW() WHERE id = $3 RETURNING *';
      updateParams = [status, notes, influencerId];
    } else {
      updateQuery = 'UPDATE influencers SET status = $1, admin_notes = $2 WHERE id = $3 RETURNING *';
      updateParams = [status, notes, influencerId];
    }
    
    const result = await client.query(updateQuery, updateParams);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Influencer not found" });
    }
    
    return res.status(200).json({
      success: true,
      message: `Influencer ${status} successfully`,
      influencer: result.rows[0]
    });
    
  } catch (error: any) {
    console.error("Error updating influencer status:", error);
    return res.status(500).json({ 
      error: "Failed to update influencer status",
      detail: error.message 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}