// The workspace shape sent to pages and the client. Kept apart from the server
// code so Client Components can import it.

export type Workspace = {
  /** Also the ID of the workspace's Appwrite team. */
  id: string;
  name: string;
  slug: string;
  /** Same-origin URL of the workspace image, or null if it has none. */
  imageUrl: string | null;
};
