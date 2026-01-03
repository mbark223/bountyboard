import { VercelRequest, VercelResponse } from "@vercel/node";
import pg from "pg";

const { Pool } = pg;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;
    
    // Basic validation
    if (!data.email || !data.firstName || !data.lastName || !data.instagramHandle) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Try to connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const client = await pool.connect();
      
      // Check if email already exists
      const existingCheck = await client.query(
        'SELECT id FROM influencers WHERE email = $1',
        [data.email]
      );
      
      if (existingCheck.rows.length > 0) {
        client.release();
        await pool.end();
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
      
      client.release();
      await pool.end();
      
      return res.status(201).json({
        success: true,
        message: "Application submitted successfully!",
        applicationId: insertResult.rows[0].id
      });
      
    } catch (dbError: any) {
      await pool.end();
      throw dbError;
    }
    
  } catch (error: any) {
    console.error("Error in test-apply:", error);
    return res.status(500).json({ 
      error: "Failed to submit application",
      detail: error.message 
    });
  }
}