import { config } from "dotenv";
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env.local" });

async function applyFix() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("❌ Missing environment variables");
    process.exit(1);
  }

  console.log("🔧 Fixing Entry table foreign key...\n");

  const client = createClient({ url, authToken });

  try {
    // Read the SQL file
    const sql = readFileSync(join(__dirname, "fix-entry-fk.sql"), "utf-8");

    // Remove comments and split into individual statements
    const statements = sql
      .split("\n")
      .filter((line) => !line.trim().startsWith("--") && line.trim().length > 0)
      .join("\n")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`${i + 1}. ${stmt.substring(0, 60)}...`);
      await client.execute(stmt);
      console.log("   ✅ Success\n");
    }

    console.log("🎉 Fix applied successfully!\n");

    // Verify the fix
    console.log("Verifying foreign key...");
    const check = await client.execute("PRAGMA foreign_key_list(Entry)");
    console.log("\nForeign keys on Entry table:");
    check.rows.forEach((row) => {
      console.log(`  - Column: ${row.from} -> ${row.table}.${row.to}`);
    });

    if (check.rows.some((row: any) => row.table === "User")) {
      console.log("\n✅ Foreign key now correctly points to User table!");
    }

    client.close();
  } catch (error) {
    console.error("\n❌ Error applying fix:");
    console.error(error);
    client.close();
    process.exit(1);
  }
}

applyFix();
