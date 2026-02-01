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
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='Entry'"
    );

    console.log("=== CURRENT ENTRY TABLE SCHEMA ===\n");
    console.log(schema.rows[0].sql);

    client.close();
  } catch (error) {
    console.error("Error:", error);
    client.close();
  }
}

checkSchema();
