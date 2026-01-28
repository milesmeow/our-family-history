/**
 * Script to apply migrations to Turso database
 * Run with: npx tsx scripts/apply-migration.ts
 */

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

async function applyMigration() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("❌ TURSO_DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  console.log("🔗 Connecting to Turso...");
  console.log(`   URL: ${url.substring(0, 30)}...`);

  const client = createClient({
    url,
    authToken,
  });

  // Read the migration SQL
  const sql = readFileSync("prisma/migration.sql", "utf-8");

  // Split by statement boundaries (-- CreateTable, -- CreateIndex, etc.)
  const statements: string[] = [];
  let currentStatement = "";

  for (const line of sql.split("\n")) {
    if (line.startsWith("-- Create") && currentStatement.trim()) {
      statements.push(currentStatement.trim());
      currentStatement = "";
    }
    if (!line.startsWith("--")) {
      currentStatement += line + "\n";
    }
  }
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  console.log(`📝 Found ${statements.length} SQL statements to execute`);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 50).replace(/\n/g, " ");

    try {
      await client.execute(stmt);
      console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
    } catch (error: any) {
      // Ignore "table already exists" errors
      if (error.message?.includes("already exists")) {
        console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (already exists): ${preview}...`);
      } else {
        console.error(`❌ [${i + 1}/${statements.length}] Failed: ${preview}...`);
        console.error(`   Error: ${error.message}`);
      }
    }
  }

  console.log("\n✨ Migration complete!");

  // Verify by listing tables
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log("\n📋 Tables in database:");
  tables.rows.forEach((row) => {
    console.log(`   - ${row.name}`);
  });

  client.close();
}

applyMigration().catch(console.error);
