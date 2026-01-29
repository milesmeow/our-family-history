"use server";

/**
 * User Management Server Actions
 *
 * These actions manage user accounts in the family history app.
 * User deletion is admin-only and preserves family content (entries/comments)
 * by setting authorId to null rather than cascading deletes.
 *
 * Key behaviors:
 * - Only admins can delete users
 * - Cannot delete the last admin (prevents orphaned family)
 * - Person profiles are unlinked (not deleted) to preserve family tree
 * - Sessions and accounts are cascade-deleted
 * - Entries and comments have authorId set to null
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string };

/**
 * Delete a user account.
 *
 * This action:
 * 1. Verifies the caller is an admin
 * 2. Prevents deletion of the last admin
 * 3. Unlinks any associated Person profile (keeps them in family tree)
 * 4. Deletes the user (cascades to sessions/accounts, sets null on content)
 *
 * @param userId - The ID of the user to delete
 * @returns ActionResult indicating success or failure
 *
 * @example
 * const result = await deleteUser("user_123");
 * if (result.success) {
 *   // User deleted, their entries now show "Unknown Author"
 * }
 */
export async function deleteUser(userId: string): Promise<ActionResult> {
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
    return { success: false, error: "Only administrators can delete users" };
  }

  try {
    // Fetch the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, personId: true, email: true },
    });

    if (!targetUser) {
      return { success: false, error: "User not found" };
    }

    // If target is an admin, check if they're the last one
    if (targetUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        return {
          success: false,
          error: "Cannot delete the last administrator. Promote another user to admin first.",
        };
      }
    }

    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Unlink Person profile if exists (keeps Person in family tree)
      if (targetUser.personId) {
        await tx.user.update({
          where: { id: userId },
          data: { personId: null },
        });
      }

      // Delete the user
      // - Sessions and Accounts cascade delete (defined in schema)
      // - Entries and Comments have authorId set to null (onDelete: SetNull)
      // - Invitations have invitedById set to null (onDelete: SetNull)
      await tx.user.delete({
        where: { id: userId },
      });
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
