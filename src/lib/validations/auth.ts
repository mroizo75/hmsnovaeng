import { z } from "zod";

/**
 * SIKKERHET: Input Validation for Authentication
 * 
 * Alle auth-relaterte requests valideres med Zod schemas.
 */

// Email validation
export const emailSchema = z
  .string()
  .email("Ugyldig e-postadresse")
  .min(3, "E-postadressen er for kort")
  .max(255, "E-postadressen er for lang")
  .toLowerCase()
  .trim();

// Password validation (strict)
export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (!@#$%^&* etc.)");

// Password validation (legacy - for existing users)
export const passwordSchemaLegacy = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

// Name validation
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name is too long")
  .trim()
  .regex(/^[a-zA-ZæøåÆØÅ\s\-']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

// Organization number (Norwegian)
export const orgNumberSchema = z
  .string()
  .regex(/^\d{9}$/, "Organization number must be 9 digits")
  .optional()
  .or(z.literal(""));

// Phone number (Norwegian)
export const phoneSchema = z
  .string()
  .regex(/^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, "Invalid phone number")
  .optional()
  .or(z.literal(""));

// Token validation
export const tokenSchema = z
  .string()
  .min(32, "Invalid token")
  .max(256, "Invalid token")
  .regex(/^[a-f0-9]+$/, "Invalid token format");

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchemaLegacy, // Use legacy for login
});

/**
 * Password Reset Request Schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Password Reset Schema
 */
export const resetPasswordSchema = z.object({
  token: tokenSchema,
  password: passwordSchema, // Use strict for new passwords
});

/**
 * Email Verification Schema
 */
export const verifyEmailSchema = z.object({
  token: tokenSchema,
});

/**
 * Resend Verification Schema
 */
export const resendVerificationSchema = z.object({
  email: emailSchema,
});

/**
 * Change Password Schema (for logged-in users)
 */
export const changePasswordSchema = z.object({
  currentPassword: passwordSchemaLegacy,
  newPassword: passwordSchema, // Use strict for new passwords
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * Update Profile Schema
 */
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
});

/**
 * Register User Schema
 */
export const registerUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional(),
  companyName: z.string().min(1, "Company name is required").max(200).trim().optional(),
  orgNumber: orgNumberSchema.optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;

