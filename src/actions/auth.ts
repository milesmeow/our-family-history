"use server";

/**
 * Authentication Server Actions
 *
 * These actions manage password-based authentication in the family history app.
 *
 * Key behaviors:
 * - Admins can create accounts with temporary passwords
 * - Admins can reset user passwords
 * - Users can change their own passwords
 * - Users can request password reset via email
 * - All passwords are hashed with bcrypt
 * - Sessions are invalidated on password change
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  createUserSchema,
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { sendNewAccountEmail } from "@/lib/email/new-account";
import { sendPasswordResetEmail } from "@/lib/email/password-reset";
import { sendPasswordChangedEmail } from "@/lib/email/password-changed";

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string };

/**
 * Generate a secure random password.
 *
 * @param length - Length of password (default 16)
 * @returns Random alphanumeric password
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

/**
 * Create a new user account with a temporary password (admin only).
 *
 * This action:
 * 1. Verifies the caller is an admin
 * 2. Validates form data
 * 3. Checks email is not already registered
 * 4. Generates a secure temporary password
 * 5. Hashes the password with bcrypt
 * 6. Creates the user with requirePasswordChange=true
 * 7. Sends email with temporary password
 *
 * @param prevState - Previous action state (for useActionState)
 * @param formData - Form data with email, name, and role
 * @returns ActionResult with success or error
 */
export async function createUserWithPassword(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify caller is admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "ADMIN") {
    return {
      success: false,
      error: "Only administrators can create user accounts",
    };
  }

  try {
    // Validate form data
    const rawData = {
      email: formData.get("email"),
      name: formData.get("name"),
      role: formData.get("role"),
    };

    const validatedData = createUserSchema.parse(rawData);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email address already exists",
      };
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        passwordHash,
        requirePasswordChange: true,
      },
    });

    // Send email with temporary password
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const loginUrl = `${baseUrl}/login`;

    await sendNewAccountEmail({
      to: newUser.email,
      temporaryPassword,
      loginUrl,
      name: newUser.name || "User",
    });

    revalidatePath("/settings");

    return {
      success: true,
      data: { email: newUser.email },
    };
  } catch (error) {
    console.error("Failed to create user:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create user account" };
  }
}

/**
 * Change the current user's password.
 *
 * This action:
 * 1. Verifies the user is logged in
 * 2. Validates current and new passwords
 * 3. Verifies current password is correct
 * 4. Hashes new password
 * 5. Updates password and clears requirePasswordChange flag
 * 6. Invalidates all sessions (forces re-login)
 * 7. Sends confirmation email
 *
 * @param prevState - Previous action state (for useActionState)
 * @param formData - Form data with currentPassword, newPassword, confirmPassword
 * @returns ActionResult with success or error
 */
export async function changePassword(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Validate form data
    const rawData = {
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const validatedData = changePasswordSchema.parse(rawData);

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "User not found or no password set" };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      validatedData.currentPassword,
      user.passwordHash
    );

    if (!isValidPassword) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password and clear requirePasswordChange flag
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          requirePasswordChange: false,
        },
      });

      // Invalidate all sessions (user must re-login)
      await tx.session.deleteMany({
        where: { userId: user.id },
      });
    });

    // Send confirmation email
    await sendPasswordChangedEmail({
      to: user.email,
      name: user.name,
      changedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to change password:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to change password" };
  }
}

/**
 * Reset a user's password (admin only).
 *
 * This action:
 * 1. Verifies the caller is an admin
 * 2. Generates a new temporary password
 * 3. Hashes the password
 * 4. Updates user with new password and requirePasswordChange=true
 * 5. Invalidates all user sessions
 * 6. Sends email with temporary password
 *
 * @param userId - The ID of the user whose password to reset
 * @returns ActionResult with success or error and temporary password
 */
export async function resetUserPassword(
  userId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify caller is admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "ADMIN") {
    return {
      success: false,
      error: "Only administrators can reset user passwords",
    };
  }

  try {
    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!targetUser) {
      return { success: false, error: "User not found" };
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Hash password
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    // Update user password and invalidate sessions
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          requirePasswordChange: true,
        },
      });

      // Invalidate all sessions
      await tx.session.deleteMany({
        where: { userId },
      });
    });

    // Send email with temporary password
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const loginUrl = `${baseUrl}/login`;

    await sendNewAccountEmail({
      to: targetUser.email,
      temporaryPassword,
      loginUrl,
      name: targetUser.name || "User",
    });

    revalidatePath("/settings");

    return {
      success: true,
      data: { temporaryPassword },
    };
  } catch (error) {
    console.error("Failed to reset password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

/**
 * Request a password reset (self-service).
 *
 * This action:
 * 1. Validates email address
 * 2. Checks if user exists (silent - no enumeration)
 * 3. Generates reset token and expiry (1 hour)
 * 4. Saves token to user record
 * 5. Sends email with reset link
 * 6. Always returns success (security - no user enumeration)
 *
 * @param prevState - Previous action state (for useActionState)
 * @param formData - Form data with email
 * @returns ActionResult always success for security
 */
export async function requestPasswordReset(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Validate email
    const rawData = {
      email: formData.get("email"),
    };

    const validatedData = requestPasswordResetSchema.parse(rawData);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: { id: true, email: true, name: true },
    });

    // If user exists, generate reset token and send email
    if (user) {
      // Generate reset token (32 bytes = 64 hex chars)
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Token expires in 1 hour
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      // Save token to user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Send email with reset link
      const baseUrl =
        process.env.NEXTAUTH_URL ||
        process.env.VERCEL_URL ||
        "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        name: user.name,
      });
    }

    // Always return success (don't reveal if email exists)
    return { success: true };
  } catch (error) {
    console.error("Failed to request password reset:", error);
    // Still return success for security
    return { success: true };
  }
}

/**
 * Complete password reset with token.
 *
 * This action:
 * 1. Validates token and new password
 * 2. Finds user by token
 * 3. Checks token hasn't expired
 * 4. Hashes new password
 * 5. Updates password and clears reset token
 * 6. Clears requirePasswordChange flag
 * 7. Invalidates all sessions
 * 8. Sends confirmation email
 *
 * @param prevState - Previous action state (for useActionState)
 * @param formData - Form data with token, password, confirmPassword
 * @returns ActionResult with success or error
 */
export async function resetPassword(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Validate form data
    const rawData = {
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const validatedData = resetPasswordSchema.parse(rawData);

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: validatedData.token,
      },
      select: {
        id: true,
        email: true,
        name: true,
        resetToken: true,
        resetTokenExpiry: true,
      },
    });

    if (!user || !user.resetTokenExpiry) {
      return {
        success: false,
        error: "Invalid or expired reset link. Please request a new one.",
      };
    }

    // Check if token has expired
    if (new Date() > user.resetTokenExpiry) {
      return {
        success: false,
        error: "This reset link has expired. Please request a new one.",
      };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Update password and clear reset token
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
          requirePasswordChange: false,
        },
      });

      // Invalidate all sessions
      await tx.session.deleteMany({
        where: { userId: user.id },
      });
    });

    // Send confirmation email
    await sendPasswordChangedEmail({
      to: user.email,
      name: user.name,
      changedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to reset password:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to reset password" };
  }
}
