import type { Session } from "@inventory/shared";
import { config } from "../config.ts";

const sessions = new Map<string, Session>();

export function createSession(userId: string): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    userId,
    expiresAt: Date.now() + config.sessionMaxAge,
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(sessionId: string): Session | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  // Check if expired
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return undefined;
  }

  return session;
}

export function refreshSession(sessionId: string): Session | undefined {
  const session = getSession(sessionId);
  if (!session) return undefined;

  // Sliding expiration
  session.expiresAt = Date.now() + config.sessionMaxAge;
  return session;
}

export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}
