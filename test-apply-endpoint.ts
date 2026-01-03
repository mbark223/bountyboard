// Test the /api/apply endpoint locally and on Vercel

async function testApplyEndpoint() {
  // Test data
  const testData = {
    firstName: "Test",
    lastName: "User",
    email: `test${Date.now()}@example.com`, // Unique email
    phone: "+1234567890",
    instagramHandle: "@testuser",
    tiktokHandle: "@testuser_tiktok"
  };

  console.log("Testing /api/apply endpoint...\n");
  console.log("Test data:", testData);

  // Test 1: Local endpoint (if running)
  console.log("\n1. Testing LOCAL endpoint (http://localhost:3000/api/apply):");
  try {
    const localResponse = await fetch("http://localhost:3000/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData)
    });
    
    const localResult = await localResponse.json();
    console.log("Status:", localResponse.status);
    console.log("Response:", localResult);
  } catch (error: any) {
    console.log("Local test skipped (server not running):", error.message);
  }

  // Test 2: Vercel deployment
  console.log("\n2. Testing VERCEL deployment:");
  console.log("What's your Vercel deployment URL? (e.g., https://your-app.vercel.app)");
  console.log("For now, testing with the test-apply endpoint if it exists...");
  
  // You'll need to replace this with your actual Vercel URL
  const vercelUrl = "https://your-app.vercel.app/api/apply"; // UPDATE THIS
  
  console.log("\nTo test on Vercel, run this curl command:");
  console.log(`
curl -X POST https://your-vercel-app.vercel.app/api/apply \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test${Date.now()}@example.com",
    "phone": "+1234567890",
    "instagramHandle": "@testuser",
    "tiktokHandle": "@testuser_tiktok"
  }'
  `);
}

// Also test direct database connection
async function testDatabaseDirectly() {
  console.log("\n\n3. Testing database connection directly:");
  
  try {
    const { Pool } = await import("pg");
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || "postgres://postgres:dlfz8Ztx4J4b1xlD@db.eqkmnwshqaebilojmrjt.supabase.co:6543/postgres",
      max: 1,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 10000,
    });
    
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log("✅ Database connected:", result.rows[0]);
    
    // Test influencers table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'influencers'
      );
    `);
    console.log("✅ Influencers table exists:", tableCheck.rows[0].exists);
    
    await pool.end();
  } catch (error: any) {
    console.log("❌ Database error:", error.message);
  }
}

// Run tests
testApplyEndpoint()
  .then(() => testDatabaseDirectly())
  .catch(console.error);