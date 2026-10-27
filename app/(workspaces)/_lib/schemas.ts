import * as z from 'zod';

import { WORKSPACE_IMAGE_MAX_BYTES } from '../_server/appwrite-ids';

// Shared by the workspace forms (client) and the workspace API (server). Must
// only import zod and the plain constants in appwrite-ids.

/** Accepted image types, mapped to the extension the file is stored with. */
export const WORKSPACE_IMAGE_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export const WORKSPACE_IMAGE_ACCEPT = Object.keys(WORKSPACE_IMAGE_TYPES).join(',');

const MAX_MB = WORKSPACE_IMAGE_MAX_BYTES / (1024 * 1024);

export const workspaceImage = z
  .instanceof(File, { message: 'Choose an image' })
  .refine((file) => file.type in WORKSPACE_IMAGE_TYPES, 'Use a PNG, JPEG or WebP image')
  .refine((file) => file.size <= WORKSPACE_IMAGE_MAX_BYTES, `The image must be ${MAX_MB} MB or smaller`);

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, 'Enter a workspace name').max(64, 'Name is too long'),
  image: workspaceImage.optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
