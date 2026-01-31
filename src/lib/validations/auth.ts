import { z } from "zod";

export const ROLES = ["ADMIN", "MEMBER", "VIEWER"] as const;

// Password validation with complexity requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Login credentials validation
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

// Create user validation (admin creates account)
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),
  name: z.string().min(1, "Name is required").max(100),
  role: z.enum(ROLES).default("MEMBER"),
});

// Change password validation (for logged-in users)
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Password reset request validation
export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),
});

// Password reset completion validation
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type RequestPasswordResetFormData = z.infer<
  typeof requestPasswordResetSchema
>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type Role = (typeof ROLES)[number];
