// IDs of the Appwrite resources behind workspaces. Created and kept in sync by
// `npm run appwrite:setup` (scripts/setup-appwrite.mts), which imports this
// file directly — keep it free of imports and non-erasable TS syntax.

export const DATABASE_ID = 'tasker';

/** One row per workspace; the row ID is the ID of the workspace's Appwrite team. */
export const WORKSPACES_TABLE_ID = 'workspaces';

/** Workspace images (logos). Each file is readable by the workspace's team. */
export const WORKSPACE_IMAGES_BUCKET_ID = 'workspace-images';

export const WORKSPACE_IMAGE_MAX_BYTES = 1024 * 1024;
export const WORKSPACE_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];
