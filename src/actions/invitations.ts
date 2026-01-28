"use server";

/**
 * Invitation Server Actions
 *
 * These actions manage the invitation system for email gating.
 * All actions are admin-only and require authentication.
 *
 * Flow:
 * 1. Admin calls createInvitation() → email sent with unique token
 * 2. Invitee clicks link → lands on /invite/[token]
 * 3. Invitee proceeds to /login → magic link sent (approved via invitation)
 * 4. On first login, createUser event in auth.ts consumes the invitation
 *
 * @see docs/EMAIL_GATING.md for full documentation
 * @see src/lib/auth.ts for how invitations are consumed
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvitationEmail } from "@/lib/email/invitation";
import { invitationFormSchema } from "@/lib/validations/invitation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string };

/**
 * Number of days until an invitation expires.
 * Expired invitations can be resent by admins.
 */
const INVITATION_EXPIRY_DAYS = 7;

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getBaseUrl(): string {
  // Use NEXTAUTH_URL if set, otherwise construct from headers
  return process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

/**
 * Create a new invitation and send email to the invitee.
 *
 * @param _prevState - Previous action state (for useActionState)
 * @param formData - Form data with email and role fields
 * @returns ActionResult with invitation ID on success
 *
 * @throws Error if not authenticated or not admin
 * @throws Error if email already registered
 * @throws Error if pending invitation exists (use resend instead)
 *
 * @example
 * // In a React component with useActionState:
 * const [state, action] = useActionState(createInvitation, null);
 * <form action={action}>
 *   <input name="email" type="email" required />
 *   <select name="role">
 *     <option value="MEMBER">Member</option>
 *     <option value="VIEWER">Viewer</option>
 *   </select>
 * </form>
 */
export async function createInvitation(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Check if user is admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });

  if (currentUser?.role !== "ADMIN") {
    return { success: false, error: "Only administrators can send invitations" };
  }

  // Validate form data
  const rawData = {
    email: formData.get("email"),
    role: formData.get("role") || "MEMBER",
  };

  const validatedFields = invitationFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.issues[0].message };
  }

  const { email, role } = validatedFields.data;

  try {
    // Check if email already belongs to an existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "This email is already registered" };
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return {
        success: false,
        error: "A pending invitation already exists for this email. Use resend to send it again.",
      };
    }

    // Create invitation
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        role,
        expiresAt,
        invitedById: session.user.id,
      },
    });

    // Send invitation email
    const inviteUrl = `${getBaseUrl()}/invite/${token}`;
    await sendInvitationEmail({
      to: email,
      inviteUrl,
      inviterName: currentUser.name,
      role,
      expiresAt,
    });

    revalidatePath("/settings");
    return { success: true, data: { id: invitation.id } };
  } catch (error) {
    console.error("Failed to create invitation:", error);
    return { success: false, error: "Failed to send invitation" };
  }
}

/**
 * Resend an existing invitation with a new token and extended expiry.
 *
 * This generates a completely new token (invalidating the old one) and
 * extends the expiration by INVITATION_EXPIRY_DAYS from now.
 *
 * Use this for:
 * - Expired invitations that need to be reactivated
 * - Invitees who lost or didn't receive the original email
 *
 * @param invitationId - The ID of the invitation to resend
 * @returns ActionResult indicating success or failure
 *
 * @throws Error if invitation not found
 * @throws Error if invitation already used
 */
export async function resendInvitation(invitationId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Check if user is admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });

  if (currentUser?.role !== "ADMIN") {
    return { success: false, error: "Only administrators can resend invitations" };
  }

  try {
    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return { success: false, error: "Invitation not found" };
    }

    if (invitation.usedAt) {
      return { success: false, error: "This invitation has already been used" };
    }

    // Generate new token and extend expiry
    const newToken = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        token: newToken,
        expiresAt,
      },
    });

    // Send new invitation email
    const inviteUrl = `${getBaseUrl()}/invite/${newToken}`;
    await sendInvitationEmail({
      to: invitation.email,
      inviteUrl,
      inviterName: currentUser.name,
      role: invitation.role,
      expiresAt,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to resend invitation:", error);
    return { success: false, error: "Failed to resend invitation" };
  }
}

/**
 * Revoke (delete) a pending invitation.
 *
 * This permanently deletes the invitation, making the token invalid.
 * Cannot revoke invitations that have already been used.
 *
 * Use this when:
 * - Invitation was sent to wrong email
 * - Admin wants to prevent someone from joining
 * - Cleaning up old invitations
 *
 * @param invitationId - The ID of the invitation to revoke
 * @returns ActionResult indicating success or failure
 *
 * @throws Error if invitation not found
 * @throws Error if invitation already used (delete user instead)
 */
export async function revokeInvitation(invitationId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Check if user is admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "ADMIN") {
    return { success: false, error: "Only administrators can revoke invitations" };
  }

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return { success: false, error: "Invitation not found" };
    }

    if (invitation.usedAt) {
      return { success: false, error: "Cannot revoke an invitation that has already been used" };
    }

    await prisma.invitation.delete({
      where: { id: invitationId },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to revoke invitation:", error);
    return { success: false, error: "Failed to revoke invitation" };
  }
}

