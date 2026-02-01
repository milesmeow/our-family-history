import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

/**
 * Clean up orphaned tables left over from migrations
 * These are harmless but can clutter the database
 */
async function cleanup() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("❌ Missing environment variables");
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  console.log("🧹 Cleaning up orphaned tables...\n");

  try {
    // Find all tables ending with _old or _new
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%_old' OR name LIKE '%_new')"
    );

    if (tables.rows.length === 0) {
      console.log("✅ No orphaned tables found - database is clean!\n");
      client.close();
      return;
    }

    console.log(`Found ${tables.rows.length} orphaned table(s):\n`);
    tables.rows.forEach((row) => {
      console.log(`  - ${row.name}`);
    });

    console.log("\nDropping orphaned tables...\n");

    for (const row of tables.rows) {
      try {
        await client.execute(`DROP TABLE IF EXISTS "${row.name}"`);
        console.log(`  ✅ Dropped ${row.name}`);
      } catch (error) {
        console.error(`  ⚠️  Could not drop ${row.name}:`, error instanceof Error ? error.message : error);
      }
    }

    console.log("\n✅ Cleanup complete!\n");
    client.close();
  } catch (error) {
    console.error("\n❌ Cleanup error:");
    console.error(error);
    client.close();
    process.exit(1);
  }
}

cleanup();
