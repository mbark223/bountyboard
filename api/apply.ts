import { VercelRequest, VercelResponse } from "@vercel/node";
import pg from "pg";

const { Pool } = pg;

// Create a single pool instance that's reused across requests
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Use these settings for Supabase pooled connections
  max: 1, // Serverless functions should use minimal connections
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
    const data = req.body;
    
    // Basic validation
    if (!data.email || !data.firstName || !data.lastName || !data.instagramHandle) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get a client from the pool
    client = await pool.connect();
    
    // Check if email already exists
    const existingCheck = await client.query(
      'SELECT id FROM influencers WHERE email = $1',
      [data.email]
    );
    
    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ error: "An application with this email already exists" });
    }
    
    // Insert new application
    const insertResult = await client.query(
      `INSERT INTO influencers (
        first_name, last_name, email, phone, 
        instagram_handle, tiktok_handle, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
      RETURNING id`,
      [
        data.firstName,
        data.lastName,
        data.email,
        data.phone || null,
        data.instagramHandle,
        data.tiktokHandle || null
      ]
    );
    
    return res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      applicationId: insertResult.rows[0].id
    });
    
  } catch (error: any) {
    console.error("Error in apply endpoint:", error);
    return res.status(500).json({ 
      error: "Failed to submit application",
      detail: error.message 
    });
  } finally {
    // Always release the client back to the pool
    if (client) {
      client.release();
    }
  }
}