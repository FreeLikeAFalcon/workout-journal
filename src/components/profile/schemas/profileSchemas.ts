
import { z } from "zod";

// Schema for profile form validation
export const profileFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  weight: z.number().min(20).max(500).optional(),
  email: z.string().email('Invalid email address'),
});

// Schema for password form validation
export const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types for our forms
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
