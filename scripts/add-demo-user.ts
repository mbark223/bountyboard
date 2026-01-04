import { db, pool } from "../server/db";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";

async function addDemoUser() {
  console.log("👤 Adding demo user...");

  try {
    // Check if demo user already exists
    const existingUser = await db.execute(sql`
      SELECT id FROM users WHERE id = 'demo-user-1'
    `);

    if (existingUser.rows.length > 0) {
      console.log("Demo user already exists, updating...");
      await db.execute(sql`
        UPDATE users 
        SET 
          org_name = 'Hard Rock Bet',
          org_slug = 'hard-rock-bet',
          org_logo_url = 'https://www.hardrock.bet/content/dam/hrb/logos/hr-bet-logo.svg',
          org_website = 'https://www.hardrock.bet',
          org_description = 'Hard Rock Bet - Where Legends Play',
          updated_at = NOW()
        WHERE id = 'demo-user-1'
      `);
    } else {
      console.log("Creating demo user...");
      await db.insert(users).values({
        id: "demo-user-1",
        email: "demo@hardrock.bet",
        role: "admin",
        orgName: "Hard Rock Bet",
        orgSlug: "hard-rock-bet",
        orgLogoUrl: "https://www.hardrock.bet/content/dam/hrb/logos/hr-bet-logo.svg",
        orgWebsite: "https://www.hardrock.bet",
        orgDescription: "Hard Rock Bet - Where Legends Play",
        onboardingCompleted: 1
      });
    }

    console.log("✅ Demo user setup completed!");
    
  } catch (error) {
    console.error("❌ Error setting up demo user:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the function
addDemoUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));