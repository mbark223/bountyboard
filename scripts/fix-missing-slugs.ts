// Script to fix missing slugs in existing briefs
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const { Pool } = pg;

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function fixMissingSlugs() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  try {
    // First, check for briefs with null slugs
    const checkResult = await pool.query(`
      SELECT id, title, slug 
      FROM briefs 
      WHERE slug IS NULL OR slug = ''
    `);
    
    console.log(`Found ${checkResult.rows.length} briefs with missing slugs`);
    
    if (checkResult.rows.length === 0) {
      console.log('All briefs have slugs!');
      return;
    }
    
    // Generate slugs for briefs that don't have them
    for (const brief of checkResult.rows) {
      const slug = generateSlug(brief.title);
      console.log(`Updating brief ${brief.id}: "${brief.title}" -> slug: "${slug}"`);
      
      try {
        await pool.query(
          'UPDATE briefs SET slug = $1 WHERE id = $2',
          [slug, brief.id]
        );
      } catch (error: any) {
        // If slug already exists, append the ID
        if (error.code === '23505') { // Unique violation
          const uniqueSlug = `${slug}-${brief.id}`;
          console.log(`  Slug "${slug}" already exists, using "${uniqueSlug}"`);
          await pool.query(
            'UPDATE briefs SET slug = $1 WHERE id = $2',
            [uniqueSlug, brief.id]
          );
        } else {
          throw error;
        }
      }
    }
    
    console.log('Successfully updated all missing slugs!');
    
    // Show all briefs with their slugs
    const allBriefs = await pool.query(`
      SELECT id, title, slug, status 
      FROM briefs 
      ORDER BY created_at DESC
    `);
    
    console.log('\nAll briefs:');
    allBriefs.rows.forEach(brief => {
      console.log(`  ${brief.id}: ${brief.title} -> ${brief.slug} (${brief.status})`);
    });
    
  } catch (error) {
    console.error('Error fixing slugs:', error);
  } finally {
    await pool.end();
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Run the script
fixMissingSlugs().catch(console.error);