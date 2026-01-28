/**
 * Invitation Form Validation Schema
 *
 * Validates invitation form submissions with:
 * - Email: Required, valid format, normalized to lowercase
 * - Role: ADMIN, MEMBER, or VIEWER (defaults to MEMBER)
 *
 * The email transformation is critical for security:
 * - Normalizes case to prevent "John@Example.com" vs "john@example.com" mismatches
 * - Trims whitespace to prevent accidental spaces
 *
 * @see src/actions/invitations.ts for usage
 */

import { z } from "zod";

/**
 * Zod schema for invitation form validation.
 *
 * @example
 * const result = invitationFormSchema.safeParse({
 *   email: "Cousin@Example.com",
 *   role: "MEMBER"
 * });
 * // result.data.email === "cousin@example.com"
 */
export const invitationFormSchema = z.object({
  /** Email address - normalized to lowercase and trimmed */
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),
  /** User role - determines permissions after sign-up */
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

/** TypeScript type inferred from the schema */
export type InvitationFormData = z.infer<typeof invitationFormSchema>;
