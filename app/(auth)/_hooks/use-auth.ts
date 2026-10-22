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

const requestRecovery = client.api.auth.recovery.$post;
const confirmRecovery = client.api.auth.recovery.$put;

export type ForgotPasswordInput = InferRequestType<typeof requestRecovery>['json'];
export type ResetPasswordInput = InferRequestType<typeof confirmRecovery>['json'];

// Sends the reset email. Succeeds for unknown emails too (no account enumeration).
export const useForgotPassword = () =>
  useMutation<InferResponseType<typeof requestRecovery, 200>, ApiError, ForgotPasswordInput>({
    mutationFn: (json) => unwrap(requestRecovery({ json })),
  });

// Sets the new password. An invalid/expired link fails with code RECOVERY_LINK_INVALID.
export const useResetPassword = () =>
  useMutation<InferResponseType<typeof confirmRecovery, 200>, ApiError, ResetPasswordInput>({
    mutationFn: (json) => unwrap(confirmRecovery({ json })),
  });
