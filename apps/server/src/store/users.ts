import type { User, StoredCredential } from "@inventory/shared";

const users = new Map<string, User>();
const credentialToUser = new Map<string, string>(); // credentialId -> userId

export function createUser(name: string): User {
  const user: User = {
    id: crypto.randomUUID(),
    name,
    credentials: [],
    createdAt: new Date().toISOString(),
  };
  users.set(user.id, user);
  return user;
}

export function getUserById(id: string): User | undefined {
  return users.get(id);
}

export function getUserByCredentialId(credentialId: string): User | undefined {
  const userId = credentialToUser.get(credentialId);
  if (!userId) return undefined;
  return users.get(userId);
}

export function addCredentialToUser(
  userId: string,
  credential: StoredCredential
): void {
  const user = users.get(userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }
  user.credentials.push(credential);
  credentialToUser.set(credential.id, userId);
}

export function getCredentialById(
  userId: string,
  credentialId: string
): StoredCredential | undefined {
  const user = users.get(userId);
  if (!user) return undefined;
  return user.credentials.find((c) => c.id === credentialId);
}

export function updateCredentialCounter(
  userId: string,
  credentialId: string,
  counter: number
): void {
  const user = users.get(userId);
  if (!user) return;
  const credential = user.credentials.find((c) => c.id === credentialId);
  if (credential) {
    credential.counter = counter;
  }
}
