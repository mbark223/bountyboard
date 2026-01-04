import { db, pool } from "../server/db";
import { briefs } from "@shared/schema";
import { sql } from "drizzle-orm";

async function updateBriefsToHardRock() {
  console.log("🔄 Updating all briefs to Hard Rock Bet...");

  try {
    // Update the NFL Playoffs brief to be Hard Rock themed
    console.log("Updating NFL Playoffs brief...");
    await db.execute(sql`
      UPDATE briefs 
      SET 
        org_name = 'Hard Rock Bet',
        business_line = 'Sportsbook',
        state = 'Florida',
        title = 'Hard Rock NFL Playoffs',
        slug = 'hard-rock-nfl-playoffs',
        overview = 'Show your playoff spirit with Hard Rock Bet! Create content showcasing your game day rituals and playoff predictions.',
        requirements = ARRAY[
          'Feature Hard Rock Bet app prominently',
          'Wear your team colors with Hard Rock gear',
          'Share your playoff predictions',
          'Include responsible gaming message',
          'Use #HardRockPlayoffs'
        ],
        reward_type = 'BONUS_BETS',
        reward_amount = '1500',
        reward_description = 'in Free Bets',
        updated_at = NOW()
      WHERE slug = 'nfl-playoffs-hype'
    `);

    // Update the Huff N Puff brief to be Hard Rock themed
    console.log("Updating Huff N Puff brief...");
    await db.execute(sql`
      UPDATE briefs 
      SET 
        org_name = 'Hard Rock Bet',
        business_line = 'Casino',
        state = 'Florida',
        title = 'Hard Rock Casino Legends',
        slug = 'hard-rock-casino-legends',
        overview = 'Showcase the legendary casino experience at Hard Rock! Create content featuring your favorite casino games and big win moments.',
        requirements = ARRAY[
          'Show Hard Rock Casino app',
          'Feature your favorite casino game',
          'Share a winning moment or strategy',
          'Keep it fun and energetic',
          'Include #HardRockLegends',
          'Responsible gaming message required'
        ],
        reward_type = 'CASH',
        reward_amount = '1000',
        reward_currency = 'USD',
        reward_description = NULL,
        updated_at = NOW()
      WHERE slug = 'huff-n-even-more-puff'
    `);

    // Also update the first brief to ensure consistency
    console.log("Updating PMR New Years brief for consistency...");
    await db.execute(sql`
      UPDATE briefs 
      SET 
        updated_at = NOW()
      WHERE slug = 'pmr-new-years-2025'
    `);

    console.log("✅ All briefs updated successfully!");
    
    // Fetch and display the updated briefs
    const updatedBriefs = await db.execute(sql`
      SELECT title, org_name, business_line, state, slug 
      FROM briefs 
      WHERE status = 'PUBLISHED'
      ORDER BY id
    `);
    
    console.log("\n📋 Updated briefs:");
    updatedBriefs.rows.forEach((brief: any) => {
      console.log(`- ${brief.title} (${brief.org_name} - ${brief.business_line}) in ${brief.state}`);
      console.log(`  URL: /b/${brief.slug}`);
    });
    
  } catch (error) {
    console.error("❌ Error updating briefs:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the update function
updateBriefsToHardRock()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));