import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

/**
 * Verify database schema has correct foreign key relationships
 * Run this after any table rebuild operations to ensure FKs are pointing to correct tables
 */
async function verifySchema() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("❌ Missing environment variables");
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  console.log("🔍 Verifying database schema...\n");

  let hasErrors = false;

  try {
    // Check Entry table FKs
    console.log("Checking Entry table foreign keys...");
    const entryFKs = await client.execute("PRAGMA foreign_key_list(Entry)");

    const authorFK = entryFKs.rows.find((row: any) => row.from === "authorId");
    if (!authorFK) {
      console.error("  ❌ Missing authorId foreign key");
      hasErrors = true;
    } else if (authorFK.table !== "User") {
      console.error(`  ❌ authorId points to wrong table: ${authorFK.table} (should be User)`);
      console.error(`     Run: npx tsx scripts/apply-entry-fix.ts`);
      hasErrors = true;
    } else {
      console.log(`  ✅ authorId → User.id`);
    }

    // Check Comment table FKs
    console.log("\nChecking Comment table foreign keys...");
    const commentFKs = await client.execute("PRAGMA foreign_key_list(Comment)");

    const commentAuthorFK = commentFKs.rows.find((row: any) => row.from === "authorId");
    if (!commentAuthorFK) {
      console.error("  ❌ Missing authorId foreign key");
      hasErrors = true;
    } else if (commentAuthorFK.table !== "User") {
      console.error(`  ❌ authorId points to wrong table: ${commentAuthorFK.table}`);
      hasErrors = true;
    } else {
      console.log(`  ✅ authorId → User.id`);
    }

    const commentEntryFK = commentFKs.rows.find((row: any) => row.from === "entryId");
    if (!commentEntryFK) {
      console.error("  ❌ Missing entryId foreign key");
      hasErrors = true;
    } else if (commentEntryFK.table !== "Entry") {
      console.error(`  ❌ entryId points to wrong table: ${commentEntryFK.table}`);
      hasErrors = true;
    } else {
      console.log(`  ✅ entryId → Entry.id`);
    }

    // Check foreign keys are enabled
    console.log("\nChecking foreign key enforcement...");
    const fkStatus = await client.execute("PRAGMA foreign_keys");
    if (fkStatus.rows[0].foreign_keys === 1) {
      console.log("  ✅ Foreign keys enabled");
    } else {
      console.error("  ❌ Foreign keys are DISABLED!");
      console.error("     This is dangerous - run: PRAGMA foreign_keys = ON;");
      hasErrors = true;
    }

    // Check for orphaned tables
    console.log("\nChecking for orphaned tables...");
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_old'"
    );

    if (tables.rows.length > 0) {
      console.warn("  ⚠️  Found orphaned tables from previous migrations:");
      tables.rows.forEach((row) => {
        console.warn(`     - ${row.name}`);
      });
      console.warn("     These are harmless but can be cleaned up if desired");
    } else {
      console.log("  ✅ No orphaned tables");
    }

    client.close();

    if (hasErrors) {
      console.log("\n❌ Schema verification FAILED - fix errors above\n");
      process.exit(1);
    } else {
      console.log("\n✅ Schema verification PASSED - all foreign keys correct!\n");
    }
  } catch (error) {
    console.error("\n❌ Verification error:");
    console.error(error);
    client.close();
    process.exit(1);
  }
}

verifySchema();
