import { useMutation } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { client } from '@/app/api/client';

const login = client.api.auth.login.$post;
const register = client.api.auth.register.$post;

export type LoginInput = InferRequestType<typeof login>['json'];
export type LoginResponse = InferResponseType<typeof login>;

export type RegisterInput = InferRequestType<typeof register>['json'];
export type RegisterResponse = InferResponseType<typeof register>;

export const useLogin = () =>
  useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: async (json) => {
      const res = await login({ json });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
  });

export const useRegister = () =>
  useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: async (json) => {
      const res = await register({ json });
      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    },
  });
