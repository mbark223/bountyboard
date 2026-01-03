import pg from "pg";

const { Pool } = pg;

async function testConnection() {
  console.log("Testing database connection...");
  
  // Your provided connection strings
  const directUrl = "postgresql://postgres:dlfz8Ztx4J4b1xlD@db.eqkmnwshqaebilojmrjt.supabase.co:5432/postgres";
  const pooledUrl = "postgresql://postgres:dlfz8Ztx4J4b1xlD@db.eqkmnwshqaebilojmrjt.supabase.co:6543/postgres";
  
  // Test pooled connection with different SSL configurations
  console.log("\n1. Testing POOLED connection (port 6543) with SSL...");
  try {
    const pooledPool = new Pool({
      connectionString: pooledUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 10000,
    });
    
    const result = await pooledPool.query('SELECT NOW()');
    console.log("✅ Pooled connection successful:", result.rows[0]);
    await pooledPool.end();
  } catch (error: any) {
    console.log("❌ Pooled connection failed:", error.message);
    console.log("Error code:", error.code);
  }
  
  // Test with sslmode in URL
  console.log("\n2. Testing POOLED with sslmode=require in URL...");
  try {
    const sslUrl = pooledUrl + "?sslmode=require";
    const sslPool = new Pool({
      connectionString: sslUrl,
      max: 1,
      connectionTimeoutMillis: 10000,
    });
    
    const result = await sslPool.query('SELECT NOW()');
    console.log("✅ Pooled SSL connection successful:", result.rows[0]);
    await sslPool.end();
  } catch (error: any) {
    console.log("❌ Pooled SSL connection failed:", error.message);
    console.log("Error code:", error.code);
  }
  
  // Test if we can at least resolve the host
  console.log("\n3. Testing DNS resolution...");
  const dns = await import('dns').then(m => m.promises);
  try {
    const addresses = await dns.resolve4('db.eqkmnwshqaebilojmrjt.supabase.co');
    console.log("✅ DNS resolution successful:", addresses);
  } catch (error: any) {
    console.log("❌ DNS resolution failed:", error.message);
  }
}

testConnection().catch(console.error);