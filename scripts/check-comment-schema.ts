import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

async function checkSchema() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    const schema = await client.execute(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='Comment'"
    );

    console.log("=== CURRENT COMMENT TABLE SCHEMA ===\n");
    console.log(schema.rows[0].sql);

    const fks = await client.execute("PRAGMA foreign_key_list(Comment)");
    console.log("\n=== COMMENT TABLE FOREIGN KEYS ===\n");
    fks.rows.forEach((row) => {
      console.log(`Column: ${row.from} -> ${row.table}.${row.to}`);
    });

    client.close();
  } catch (error) {
    console.error("Error:", error);
    client.close();
  }
}

checkSchema();
