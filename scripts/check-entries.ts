import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

async function checkEntries() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    console.log("=== CHECKING ENTRIES ===\n");

    const entries = await client.execute(
      "SELECT id, title, authorId FROM Entry LIMIT 10"
    );

    console.log(`Found ${entries.rows.length} entries`);
    entries.rows.forEach((row, i) => {
      console.log(`Entry ${i+1}: ${row.title} (authorId: ${row.authorId})`);
    });

    console.log("\n=== CHECKING FK CONSTRAINTS ===\n");

    const constraints = await client.execute(
      "PRAGMA foreign_key_list(Entry)"
    );

    console.log("Foreign keys on Entry table:");
    constraints.rows.forEach((row) => {
      console.log(`  - Column: ${row.from} -> ${row.table}.${row.to}`);
    });

    console.log("\n=== CHECKING FOREIGN KEYS STATUS ===\n");
    const fkStatus = await client.execute("PRAGMA foreign_keys");
    console.log(`Foreign keys enabled: ${fkStatus.rows[0].foreign_keys === 1 ? 'YES' : 'NO'}`);

    client.close();
  } catch (error) {
    console.error("Error:", error);
    client.close();
  }
}

checkEntries();
