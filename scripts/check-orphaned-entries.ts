import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

async function checkOrphaned() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    console.log("=== CHECKING FOR ORPHANED ENTRIES ===\n");

    const result = await client.execute(`
      SELECT e.id, e.title, e.authorId
      FROM Entry e
      LEFT JOIN User u ON e.authorId = u.id
      WHERE e.authorId IS NOT NULL AND u.id IS NULL
    `);

    if (result.rows.length > 0) {
      console.log(`Found ${result.rows.length} entries with invalid authorIds:\n`);
      result.rows.forEach((row) => {
        console.log(`Entry: ${row.title}`);
        console.log(`  Invalid authorId: ${row.authorId}\n`);
      });
    } else {
      console.log("✅ No orphaned entries found!");
    }

    client.close();
  } catch (error) {
    console.error("Error:", error);
    client.close();
  }
}

checkOrphaned();
