// Load environment variables FIRST before any other imports
import { config } from "dotenv";
import { join } from "path";

config({ path: join(process.cwd(), ".env.local") });

/**
 * Admin Password Migration Script
 *
 * This script sets a temporary password for the existing admin account.
 * Run this once to migrate from magic link auth to password-based auth.
 *
 * Usage:
 *   npx tsx scripts/migrate-admin-password.ts
 *
 * The script will:
 * 1. Find the admin user in the database
 * 2. Generate a secure temporary password
 * 3. Hash the password with bcrypt
 * 4. Update the admin user with the password hash
 * 5. Set requirePasswordChange=true
 * 6. Display the temporary password (SAVE THIS!)
 */

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Create a fresh Prisma client for this script
const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const prisma = new PrismaClient({
  adapter,
  log: ["error"],
});

/**
 * Generate a secure random password.
 */
function generateTemporaryPassword(length = 16): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

async function main() {
  console.log("🔐 Admin Password Migration Script");
  console.log("=====================================\n");

  // Debug: Check if env vars are loaded
  if (!process.env.TURSO_DATABASE_URL) {
    console.error("❌ Error: TURSO_DATABASE_URL not found in environment variables");
    console.log("\nMake sure .env.local exists with:");
    console.log("TURSO_DATABASE_URL=libsql://...");
    console.log("TURSO_AUTH_TOKEN=...");
    process.exit(1);
  }

  console.log("✓ Environment variables loaded");
  console.log(`✓ Database URL: ${process.env.TURSO_DATABASE_URL.substring(0, 30)}...\n`);

  try {
    // Find the admin user
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!admin) {
      console.error("❌ Error: No admin user found in the database.");
      console.log("\nPlease ensure you have at least one user with role='ADMIN'");
      process.exit(1);
    }

    console.log(`Found admin user:`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Name: ${admin.name || "(no name set)"}`);
    console.log(`  ID: ${admin.id}`);

    // Check if admin already has a password
    if (admin.passwordHash) {
      console.log(`\n⚠️  This account already has a password set.`);
      console.log(`   Generating a NEW temporary password...\n`);
    } else {
      console.log(`\n✓ No password set - creating initial password...\n`);
    }

    // Generate temporary password
    console.log("Generating temporary password...");
    const temporaryPassword = generateTemporaryPassword();

    // Hash password with bcrypt (10 rounds)
    console.log("Hashing password with bcrypt...");
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    // Update admin user
    console.log("Updating admin user in database...");
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        requirePasswordChange: true,
      },
    });

    console.log("\n✅ Success! Admin password has been set.\n");
    console.log("═════════════════════════════════════════════════════");
    console.log("  TEMPORARY PASSWORD (SAVE THIS!)");
    console.log("═════════════════════════════════════════════════════");
    console.log(`\n  ${temporaryPassword}\n`);
    console.log("═════════════════════════════════════════════════════\n");
    console.log("Next steps:");
    console.log("1. Copy the temporary password above");
    console.log(`2. Go to your login page`);
    console.log(`3. Log in with:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: [the temporary password above]`);
    console.log(`4. You'll be prompted to change your password`);
    console.log(`5. Choose a strong permanent password\n`);
    console.log("⚠️  Important: The temporary password is shown only once!");
    console.log("    If you lose it, run this script again to generate a new one.\n");
  } catch (error) {
    console.error("\n❌ Error during migration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
