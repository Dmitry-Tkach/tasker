import * as z from 'zod';

// Shared by the auth forms (client) and the auth API routes (server), so both
// sides validate with the same rules and messages. Must only import zod.

// Appwrite limits: name ≤ 128 chars, password 8–256 chars.
export const PASSWORD_MIN = 8;
const PASSWORD_MAX = 256;

const email = z.string().trim().pipe(z.email('Enter a valid email address'));

const newPassword = z
  .string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
  .max(PASSWORD_MAX, 'Password is too long');

// Login only checks the password is present: a stricter rule here would lock
// out existing users if the password policy ever changes.
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password').max(PASSWORD_MAX, 'Password is too long'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(128, 'Name is too long'),
  email,
  password: newPassword,
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  secret: z.string().min(1),
  password: newPassword,
});

export const resetPasswordFormSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
