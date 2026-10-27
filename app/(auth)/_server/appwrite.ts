import { Client, Account, Storage, TablesDB, Teams } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT!;
const projectId = process.env.APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;

function services(client: Client) {
  return {
    account: new Account(client),
    teams: new Teams(client),
    tables: new TablesDB(client),
    storage: new Storage(client),
  };
}

// Admin client — privileged via the API key. Use for sign-up, for creating
// email/password sessions server-side, and for writes the user isn't allowed
// to make directly (e.g. workspace rows and images).
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return services(client);
}

// Session client — acts as the logged-in user via their session secret (read
// from the session cookie). Use for reading/acting on the current account;
// reads through it are limited by Appwrite's row and file permissions.
export function createSessionClient(session: string) {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setSession(session);

  return services(client);
}
