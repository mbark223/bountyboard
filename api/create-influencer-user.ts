import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

/**
 * Create a user account for an approved influencer
 * This links the influencer profile to a user account for login
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let pool: Pool | null = null;

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT id, email, user_type FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'User account already exists',
        user: userCheck.rows[0]
      });
    }

    // Get the influencer profile
    const influencerResult = await pool.query(
      'SELECT id, first_name, last_name, status FROM influencers WHERE email = $1',
      [email]
    );

    if (influencerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    const influencer = influencerResult.rows[0];

    if (influencer.status !== 'approved') {
      return res.status(400).json({
        error: 'Influencer must be approved before creating user account',
        status: influencer.status
      });
    }

    // Create user account
    const result = await pool.query(`
      INSERT INTO users (
        email,
        first_name,
        last_name,
        user_type,
        influencer_id,
        is_onboarded,
        role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, user_type, influencer_id, first_name, last_name
    `, [
      email,
      influencer.first_name,
      influencer.last_name,
      'influencer',
      influencer.id,
      true,
      'influencer'
    ]);

    console.log(`[Create User] Created user account for influencer: ${email}`);

    return res.status(201).json({
      success: true,
      message: 'User account created successfully',
      user: result.rows[0]
    });

  } catch (error: any) {
    console.error('[Create User] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
