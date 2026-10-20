import { Client, Account } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT!;
const projectId = process.env.APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;

// Admin client — privileged via the API key. Use for sign-up and for creating
// email/password sessions server-side.
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return { account: new Account(client) };
}

// Session client — acts as the logged-in user via their session secret (read
// from the session cookie). Use for reading/acting on the current account.
export function createSessionClient(session: string) {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setSession(session);

  return { account: new Account(client) };
}
