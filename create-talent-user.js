import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createTalentUser() {
  try {
    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT id, email, user_type FROM users WHERE email = $1',
      ['talent@test.com']
    );

    if (userCheck.rows.length > 0) {
      console.log('User already exists:', userCheck.rows[0]);
    } else {
      // Get the influencer ID
      const influencerCheck = await pool.query(
        'SELECT id FROM influencers WHERE email = $1',
        ['talent@test.com']
      );

      if (influencerCheck.rows.length === 0) {
        console.log('❌ Influencer not found for talent@test.com');
        await pool.end();
        return;
      }

      const influencerId = influencerCheck.rows[0].id;

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
        RETURNING id, email, user_type, influencer_id
      `, [
        'talent@test.com',
        'Test',
        'Talent',
        'influencer',
        influencerId,
        true,
        'influencer'
      ]);
      
      console.log('✅ Created user account:', result.rows[0]);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

createTalentUser();
