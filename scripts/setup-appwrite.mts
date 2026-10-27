// Creates (or brings up to date) the Appwrite resources the app needs:
// the `tasker` database, the `workspaces` table and the workspace-images bucket.
// Safe to run repeatedly: existing resources are left in place, missing columns
// and indexes are added, and the bucket's settings are re-applied.
//
//   npm run appwrite:setup
//
// Uses APPWRITE_* from .env.local. The API key needs the databases.*, tables.*,
// columns.*, indexes.* and buckets.* (read + write) scopes.

import { AppwriteException, Client, Compression, Storage, TablesDB, TablesDBIndexType } from 'node-appwrite';

import {
  DATABASE_ID,
  WORKSPACE_IMAGES_BUCKET_ID,
  WORKSPACE_IMAGE_EXTENSIONS,
  WORKSPACE_IMAGE_MAX_BYTES,
  WORKSPACES_TABLE_ID,
} from '../app/(workspaces)/_server/appwrite-ids.ts';

const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = process.env;
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error('Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID or APPWRITE_API_KEY.');
  process.exit(1);
}

const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY);
const tables = new TablesDB(client);
const storage = new Storage(client);

// All workspaces columns are short strings. Rows are only written by the server
// (API key), and each row carries its own team-scoped permissions, so the table
// itself grants nothing.
const WORKSPACE_COLUMNS = [
  { key: 'name', size: 64, required: true },
  { key: 'slug', size: 48, required: true },
  { key: 'ownerId', size: 36, required: true },
  { key: 'imageFileId', size: 36, required: false },
];

const WORKSPACE_INDEXES = [{ key: 'slug_unique', type: TablesDBIndexType.Unique, columns: ['slug'] }];

const isNotFound = (e: unknown) => e instanceof AppwriteException && e.code === 404;

/** Runs `get`; on 404 runs `create`. Returns whether it created the resource. */
async function ensure(label: string, get: () => Promise<unknown>, create: () => Promise<unknown>) {
  try {
    await get();
    console.log(`✓ ${label} exists`);
    return false;
  } catch (e) {
    if (!isNotFound(e)) throw e;
    await create();
    console.log(`+ ${label} created`);
    return true;
  }
}

/** Columns are created asynchronously; indexes can only use available ones. */
async function waitForColumns(keys: string[]) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const statuses = await Promise.all(
      keys.map(async (key) => {
        const column = (await tables.getColumn({ databaseId: DATABASE_ID, tableId: WORKSPACES_TABLE_ID, key })) as {
          status: string;
        };
        return column.status;
      }),
    );
    if (statuses.every((s) => s === 'available')) return;
    if (statuses.some((s) => s === 'failed')) throw new Error(`A column failed to create: ${statuses.join(', ')}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Timed out waiting for columns to become available.');
}

async function main() {
  await ensure(
    `database "${DATABASE_ID}"`,
    () => tables.get({ databaseId: DATABASE_ID }),
    () => tables.create({ databaseId: DATABASE_ID, name: 'Tasker' }),
  );

  await ensure(
    `table "${WORKSPACES_TABLE_ID}"`,
    () => tables.getTable({ databaseId: DATABASE_ID, tableId: WORKSPACES_TABLE_ID }),
    () =>
      tables.createTable({
        databaseId: DATABASE_ID,
        tableId: WORKSPACES_TABLE_ID,
        name: 'Workspaces',
        permissions: [],
        rowSecurity: true,
      }),
  );

  for (const { key, size, required } of WORKSPACE_COLUMNS) {
    await ensure(
      `column "${key}"`,
      () => tables.getColumn({ databaseId: DATABASE_ID, tableId: WORKSPACES_TABLE_ID, key }),
      () => tables.createVarcharColumn({ databaseId: DATABASE_ID, tableId: WORKSPACES_TABLE_ID, key, size, required }),
    );
  }
  await waitForColumns(WORKSPACE_COLUMNS.map((c) => c.key));

  for (const { key, type, columns } of WORKSPACE_INDEXES) {
    await ensure(
      `index "${key}"`,
      () => tables.getIndex({ databaseId: DATABASE_ID, tableId: WORKSPACES_TABLE_ID, key }),
      () => tables.createIndex({ databaseId: DATABASE_ID, tableId: WORKSPACES_TABLE_ID, key, type, columns }),
    );
  }

  // Files carry their own team-scoped permissions; the bucket grants nothing.
  const bucket = {
    bucketId: WORKSPACE_IMAGES_BUCKET_ID,
    name: 'Workspace images',
    permissions: [],
    fileSecurity: true,
    maximumFileSize: WORKSPACE_IMAGE_MAX_BYTES,
    allowedFileExtensions: WORKSPACE_IMAGE_EXTENSIONS,
    compression: Compression.None, // already-compressed image formats
    antivirus: true,
    transformations: true, // previews at avatar sizes
  };
  const created = await ensure(
    `bucket "${WORKSPACE_IMAGES_BUCKET_ID}"`,
    () => storage.getBucket({ bucketId: WORKSPACE_IMAGES_BUCKET_ID }),
    () => storage.createBucket(bucket),
  );
  if (!created) {
    await storage.updateBucket(bucket);
    console.log(`✓ bucket "${WORKSPACE_IMAGES_BUCKET_ID}" settings applied`);
  }

  console.log('Appwrite setup complete.');
}

main().catch((e) => {
  if (e instanceof AppwriteException) {
    console.error(`Appwrite error ${e.code} (${e.type}): ${e.message}`);
    if (e.code === 401) console.error('Check that the API key has the scopes listed at the top of this script.');
  } else {
    console.error(e);
  }
  process.exit(1);
});
