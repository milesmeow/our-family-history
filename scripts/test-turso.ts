/**
 * Test script to verify Turso database connection
 * Run with: npx tsx scripts/test-turso.ts
 */

import { config } from "dotenv";
import { createClient } from "@libsql/client";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function testTursoConnection() {
  console.log("🔍 Testing Turso database connection...\n");

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("❌ Missing environment variables:");
    if (!url) console.error("   - TURSO_DATABASE_URL is not set");
    if (!authToken) console.error("   - TURSO_AUTH_TOKEN is not set");
    process.exit(1);
  }

  console.log(`📡 Connecting to: ${url.substring(0, 50)}...`);

  try {
    const client = createClient({ url, authToken });

    // Test 1: Basic connection
    const result = await client.execute("SELECT 1 as test");
    console.log("✅ Basic connection: OK");

    // Test 2: List tables
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    console.log(`✅ Found ${tables.rows.length} tables:`);
    tables.rows.forEach((row) => {
      console.log(`   - ${row.name}`);
    });

    // Test 3: Check User table (needed for auth)
    const userCount = await client.execute("SELECT COUNT(*) as count FROM User");
    console.log(`✅ User table accessible: ${userCount.rows[0].count} users`);

    // Test 4: Check Entry table
    const entryCount = await client.execute("SELECT COUNT(*) as count FROM Entry");
    console.log(`✅ Entry table accessible: ${entryCount.rows[0].count} entries`);

    // Test 5: Check Person table
    const personCount = await client.execute("SELECT COUNT(*) as count FROM Person");
    console.log(`✅ Person table accessible: ${personCount.rows[0].count} people`);

    console.log("\n🎉 All Turso tests passed! Database is ready.");

    client.close();
  } catch (error) {
    console.error("\n❌ Turso connection failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testTursoConnection();
