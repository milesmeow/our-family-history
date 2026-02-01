import { config } from "dotenv";
import { createClient } from "@libsql/client";

// Load environment variables
config({ path: ".env.local" });

async function checkUsers() {
  console.log("=== USERS IN DATABASE ===\n");

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("❌ Missing environment variables");
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  try {
    const result = await client.execute(
      "SELECT id, email, name, role, personId FROM User ORDER BY createdAt ASC"
    );

    if (result.rows.length === 0) {
      console.log("❌ No users found in database!");
      client.close();
      return;
    }

    result.rows.forEach((row, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  Email: ${row.email}`);
      console.log(`  Name: ${row.name || "(no name)"}`);
      console.log(`  Role: ${row.role}`);
      console.log(`  PersonID: ${row.personId || "(not linked)"}`);
      console.log();
    });

    console.log(`Total users: ${result.rows.length}`);
    client.close();
  } catch (error) {
    console.error("Error:", error);
    client.close();
    process.exit(1);
  }
}

checkUsers();
