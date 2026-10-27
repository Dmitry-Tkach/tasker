import { useMutation } from '@tanstack/react-query';
import type { InferResponseType } from 'hono/client';
import { client } from '@/app/api/client';
import { ApiError, unwrap } from '@/lib/api-error';
import type { CreateWorkspaceInput } from '../_lib/schemas';

const create = client.api.workspaces.$post;

export type CreateWorkspaceResponse = InferResponseType<typeof create, 201>;

// Sent as multipart form data so the image can come along. Failed calls
// reject with ApiError (see lib/api-error.ts).
export const useCreateWorkspace = () =>
  useMutation<CreateWorkspaceResponse, ApiError, CreateWorkspaceInput>({
    mutationFn: ({ name, image }) => unwrap(create({ form: image ? { name, image } : { name } })),
  });
