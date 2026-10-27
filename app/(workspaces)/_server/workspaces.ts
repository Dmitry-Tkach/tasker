import { AppwriteException, ID, ImageFormat, Permission, Query, Role, type Models } from 'node-appwrite';

import { createAdminClient, createSessionClient } from '@/app/(auth)/_server/appwrite';
import { DATABASE_ID, WORKSPACE_IMAGES_BUCKET_ID, WORKSPACES_TABLE_ID } from './appwrite-ids';
import { WORKSPACE_IMAGE_TYPES } from '../_lib/schemas';
import type { Workspace } from '../_lib/workspace';

// Workspace data access shared by the API routes and the page DAL. Every read
// goes through the user's session client, so Appwrite's row permissions (read
// for the workspace's team) are the membership check: a workspace the user
// doesn't belong to simply isn't found.

type WorkspaceRow = Models.Row & {
  name: string;
  slug: string;
  ownerId: string;
  imageFileId: string | null;
};

function toWorkspace(row: WorkspaceRow): Workspace {
  return {
    id: row.$id,
    name: row.name,
    slug: row.slug,
    // The file ID busts caches when the image is replaced.
    imageUrl: row.imageFileId ? `/api/workspaces/${row.$id}/image?v=${row.imageFileId}` : null,
  };
}

/** The user's workspaces, oldest first. */
export async function listWorkspaces(session: string): Promise<Workspace[]> {
  const { rows } = await createSessionClient(session).tables.listRows<WorkspaceRow>({
    databaseId: DATABASE_ID,
    tableId: WORKSPACES_TABLE_ID,
    queries: [Query.orderAsc('$createdAt'), Query.limit(100)],
  });
  return rows.map(toWorkspace);
}

/** The workspace with this slug, or null if it doesn't exist or the user isn't a member. */
export async function findWorkspaceBySlug(session: string, slug: string): Promise<Workspace | null> {
  const { rows } = await createSessionClient(session).tables.listRows<WorkspaceRow>({
    databaseId: DATABASE_ID,
    tableId: WORKSPACES_TABLE_ID,
    queries: [Query.equal('slug', slug), Query.limit(1)],
  });
  return rows[0] ? toWorkspace(rows[0]) : null;
}

/** The workspace's image as a 256px WebP preview, or null if it has none. Throws 404 for non-members. */
export async function getWorkspaceImage(session: string, workspaceId: string) {
  const { tables, storage } = createSessionClient(session);
  const row = await tables.getRow<WorkspaceRow>({
    databaseId: DATABASE_ID,
    tableId: WORKSPACES_TABLE_ID,
    rowId: workspaceId,
  });
  if (!row.imageFileId) return null;

  return storage.getFilePreview({
    bucketId: WORKSPACE_IMAGES_BUCKET_ID,
    fileId: row.imageFileId,
    width: 256,
    height: 256,
    output: ImageFormat.Webp,
  });
}

/** "My Team!" → "my-team". Falls back to "workspace" for names with no latin letters or digits. */
export function slugify(name: string) {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
  return slug || 'workspace';
}

const randomSuffix = () => Math.random().toString(36).slice(2, 7);

const isConflict = (e: unknown) => e instanceof AppwriteException && e.code === 409;

/**
 * Creates a workspace owned by the signed-in user: an Appwrite team (the user
 * becomes its owner), the optional image, and the workspaces row. If a later
 * step fails, the earlier ones are undone so no half-made workspace is left.
 */
export async function createWorkspace(
  session: string,
  userId: string,
  { name, image }: { name: string; image?: File },
): Promise<Workspace> {
  const admin = createAdminClient();
  // Created as the user, so Appwrite makes them the team's owner.
  const team = await createSessionClient(session).teams.create({ teamId: ID.unique(), name });
  const teamRead = Permission.read(Role.team(team.$id));
  let imageFileId: string | null = null;

  try {
    if (image) {
      const extension = WORKSPACE_IMAGE_TYPES[image.type];
      const file = await admin.storage.createFile({
        bucketId: WORKSPACE_IMAGES_BUCKET_ID,
        fileId: ID.unique(),
        file: new File([image], `workspace.${extension}`, { type: image.type }),
        permissions: [teamRead],
      });
      imageFileId = file.$id;
    }

    // The slug index is unique: on a clash, retry with a random suffix.
    const base = slugify(name);
    for (let attempt = 0; ; attempt++) {
      const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`;
      try {
        const row = await admin.tables.createRow<WorkspaceRow>({
          databaseId: DATABASE_ID,
          tableId: WORKSPACES_TABLE_ID,
          rowId: team.$id,
          data: { name, slug, ownerId: userId, imageFileId },
          permissions: [teamRead],
        });
        return toWorkspace(row);
      } catch (e) {
        if (!isConflict(e) || attempt >= 4) throw e;
      }
    }
  } catch (e) {
    await Promise.allSettled([
      admin.teams.delete({ teamId: team.$id }),
      imageFileId && admin.storage.deleteFile({ bucketId: WORKSPACE_IMAGES_BUCKET_ID, fileId: imageFileId }),
    ]);
    throw e;
  }
}
