// Prisma config for Turso database
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local for local development
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use local SQLite for migrations (Prisma doesn't support libsql:// directly)
    // The libSQL adapter handles Turso connection at runtime
    url: "file:./prisma/dev.db",
  },
});
