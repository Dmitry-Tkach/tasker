import { useMutation } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { client } from '@/app/api/client';
import { ApiError, unwrap } from '@/lib/api-error';

const login = client.api.auth.login.$post;
const register = client.api.auth.register.$post;

export type LoginInput = InferRequestType<typeof login>['json'];
export type LoginResponse = InferResponseType<typeof login, 200>;

export type RegisterInput = InferRequestType<typeof register>['json'];
export type RegisterResponse = InferResponseType<typeof register, 201>;

// Failed calls reject with ApiError (see lib/api-error.ts).
export const useLogin = () =>
  useMutation<LoginResponse, ApiError, LoginInput>({
    mutationFn: (json) => unwrap(login({ json })),
  });

export const useRegister = () =>
  useMutation<RegisterResponse, ApiError, RegisterInput>({
    mutationFn: (json) => unwrap(register({ json })),
  });

// ---------------------------------------------------------------------------
// Password recovery
//
// Appwrite flow:
//   1. account.createRecovery(email, `${origin}/reset-password`) emails a link
//      to /reset-password?userId=...&secret=...
//   2. account.updateRecovery(userId, secret, password) sets the new password.
//
// The mutation functions below are MOCKS so every UI state (pending, error,
// success) can be exercised before the API exists. Mock triggers:
//   - forgot: an email containing "fail" rejects with a generic error.
//   - reset:  secret "expired" rejects with RecoveryLinkError; a password
//             containing "fail" rejects with a generic error.
// ---------------------------------------------------------------------------

export type ForgotPasswordInput = { email: string };
export type ResetPasswordInput = { userId: string; secret: string; password: string };

/** Thrown when the recovery link is invalid, already used, or expired. */
export class RecoveryLinkError extends Error {
  constructor(message = 'This reset link is invalid or has expired.') {
    super(message);
    this.name = 'RecoveryLinkError';
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: wire to API (POST /api/auth/recovery -> account.createRecovery)
async function requestPasswordRecovery({ email }: ForgotPasswordInput) {
  await delay(1200);
  if (email.includes('fail')) {
    throw new Error('We couldn’t send the email right now. Please try again.');
  }
  return { ok: true as const };
}

// TODO: wire to API (PUT /api/auth/recovery -> account.updateRecovery)
async function confirmPasswordRecovery({ secret, password }: ResetPasswordInput) {
  await delay(1200);
  if (secret === 'expired') throw new RecoveryLinkError();
  if (password.includes('fail')) {
    throw new Error('We couldn’t update your password. Please try again.');
  }
  return { ok: true as const };
}

export const useForgotPassword = () =>
  useMutation<{ ok: true }, Error, ForgotPasswordInput>({
    mutationFn: requestPasswordRecovery,
  });

export const useResetPassword = () =>
  useMutation<{ ok: true }, Error, ResetPasswordInput>({
    mutationFn: confirmPasswordRecovery,
  });
