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

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

  try {
    // Find the admin user
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
      },
    });

    if (!admin) {
      console.error("❌ Error: No admin user found in the database.");
      console.log("\nPlease ensure you have at least one user with role='ADMIN'");
      process.exit(1);
    }

    // Check if admin already has a password
    if (admin.passwordHash) {
      console.log(`⚠️  Admin user ${admin.email} already has a password set.`);
      console.log("\nDo you want to reset it? (y/N)");

      // In a real script, you'd wait for user input here
      // For now, we'll just exit
      console.log("\nExiting without changes.");
      process.exit(0);
    }

    console.log(`Found admin user:`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Name: ${admin.name || "(no name set)"}`);
    console.log(`  ID: ${admin.id}\n`);

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
