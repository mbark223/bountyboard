import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addTestTalent() {
  try {
    // Check if talent already exists
    const checkResult = await pool.query(
      'SELECT id, email, status FROM influencers WHERE email = $1',
      ['talent@test.com']
    );

    if (checkResult.rows.length > 0) {
      const existing = checkResult.rows[0];
      console.log('Talent already exists:', existing);
      
      // Update to approved if not already
      if (existing.status !== 'approved') {
        await pool.query(
          'UPDATE influencers SET status = $1, approved_at = NOW() WHERE email = $2',
          ['approved', 'talent@test.com']
        );
        console.log('✅ Updated talent status to approved');
      }
    } else {
      // Insert new talent
      const result = await pool.query(`
        INSERT INTO influencers (
          first_name,
          last_name,
          email,
          phone,
          instagram_handle,
          instagram_followers,
          status,
          approved_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, email, first_name, last_name, instagram_handle, status
      `, [
        'Test',
        'Talent',
        'talent@test.com',
        '555-0100',
        '@testtalent',
        10000,
        'approved'
      ]);
      
      console.log('✅ Created new test talent:', result.rows[0]);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

addTestTalent();
