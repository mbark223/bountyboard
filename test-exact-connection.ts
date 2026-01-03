import pg from "pg";

const { Pool } = pg;

async function testConnection() {
  console.log("Testing Supabase connection...");
  
  // The exact URL from your screenshot (with password)
  const connectionUrl = "postgres://postgres:dlfz8Ztx4J4b1xlD@db.eqkmnwshqaebilojmrjt.supabase.co:6543/postgres";
  
  console.log("\nTesting with different configurations...");
  
  // Test 1: Basic connection
  console.log("\n1. Basic connection test:");
  try {
    const pool1 = new Pool({
      connectionString: connectionUrl,
      max: 1,
    });
    
    const result = await pool1.query('SELECT NOW()');
    console.log("✅ Success:", result.rows[0]);
    await pool1.end();
  } catch (error: any) {
    console.log("❌ Failed:", error.message);
  }
  
  // Test 2: With SSL
  console.log("\n2. With SSL (rejectUnauthorized: false):");
  try {
    const pool2 = new Pool({
      connectionString: connectionUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });
    
    const result = await pool2.query('SELECT NOW()');
    console.log("✅ Success:", result.rows[0]);
    await pool2.end();
  } catch (error: any) {
    console.log("❌ Failed:", error.message);
  }
  
  // Test 3: With sslmode in URL
  console.log("\n3. With sslmode=require in URL:");
  try {
    const urlWithSSL = connectionUrl + "?sslmode=require";
    const pool3 = new Pool({
      connectionString: urlWithSSL,
      max: 1,
    });
    
    const result = await pool3.query('SELECT NOW()');
    console.log("✅ Success:", result.rows[0]);
    await pool3.end();
  } catch (error: any) {
    console.log("❌ Failed:", error.message);
  }
  
  // Test 4: Check what host this resolves to
  console.log("\n4. Checking host resolution:");
  try {
    const url = new URL(connectionUrl);
    console.log("Host:", url.hostname);
    console.log("Port:", url.port);
    
    // Try alternate hostnames
    const alternateHosts = [
      `${url.hostname.replace('db.', 'aws-0-us-east-1.pooler.')}`,
      `${url.hostname.replace('db.', 'pooler.')}`,
    ];
    
    console.log("\nTrying alternate pooler hostnames:");
    for (const host of alternateHosts) {
      const altUrl = connectionUrl.replace(url.hostname, host);
      console.log(`\nTrying: ${host}`);
      try {
        const pool = new Pool({
          connectionString: altUrl,
          ssl: { rejectUnauthorized: false },
          max: 1,
          connectionTimeoutMillis: 5000,
        });
        
        const result = await pool.query('SELECT NOW()');
        console.log("✅ Success with alternate host!");
        await pool.end();
        break;
      } catch (e: any) {
        console.log("❌ Failed:", e.message);
      }
    }
  } catch (error: any) {
    console.log("Error:", error.message);
  }
}

testConnection().catch(console.error);