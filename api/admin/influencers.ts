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
  
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let client;
  
  try {
    // Get query parameters
    const { status = 'pending' } = req.query;
    
    // Get a client from the pool
    client = await pool.connect();
    
    // Fetch influencers based on status with camelCase field names
    const query = status === 'all' 
      ? `SELECT 
          id,
          first_name as "firstName",
          last_name as "lastName",
          email,
          phone,
          instagram_handle as "instagramHandle",
          instagram_followers as "instagramFollowers",
          COALESCE(instagram_verified, 0) as "instagramVerified",
          tiktok_handle as "tiktokHandle",
          youtube_channel as "youtubeChannel",
          bank_account_holder_name as "bankAccountHolderName",
          status,
          COALESCE(id_verified, 0) as "idVerified",
          COALESCE(bank_verified, 0) as "bankVerified",
          admin_notes as "adminNotes",
          rejection_reason as "rejectionReason",
          created_at as "appliedAt",
          approved_at as "approvedAt",
          rejected_at as "rejectedAt"
        FROM influencers ORDER BY created_at DESC`
      : `SELECT 
          id,
          first_name as "firstName",
          last_name as "lastName",
          email,
          phone,
          instagram_handle as "instagramHandle",
          instagram_followers as "instagramFollowers",
          COALESCE(instagram_verified, 0) as "instagramVerified",
          tiktok_handle as "tiktokHandle",
          youtube_channel as "youtubeChannel",
          bank_account_holder_name as "bankAccountHolderName",
          status,
          COALESCE(id_verified, 0) as "idVerified",
          COALESCE(bank_verified, 0) as "bankVerified",
          admin_notes as "adminNotes",
          rejection_reason as "rejectionReason",
          created_at as "appliedAt",
          approved_at as "approvedAt",
          rejected_at as "rejectedAt"
        FROM influencers WHERE status = $1 ORDER BY created_at DESC`;
    
    const params = status === 'all' ? [] : [status];
    const result = await client.query(query, params);
    
    return res.status(200).json({
      success: true,
      influencers: result.rows,
      count: result.rows.length
    });
    
  } catch (error: any) {
    console.error("Error fetching influencers:", error);
    return res.status(500).json({ 
      error: "Failed to fetch influencers",
      detail: error.message 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}