import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/types";
import { config } from "../config.ts";
import {
  createUser,
  getUserById,
  getUserByCredentialId,
  addCredentialToUser,
  getCredentialById,
  updateCredentialCounter,
  createSession,
  getSession,
  refreshSession,
  deleteSession,
  createInventoryAccess,
  getInventoriesForUser,
} from "../store/index.ts";
import {
  type Env,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
} from "../app.ts";
import { getRepo } from "../repo.ts";
import type { InventoryDoc } from "@inventory/shared";

const auth = new Hono<Env>();

// Store challenges temporarily (in production, use a proper store)
const challenges = new Map<string, string>(); // tempId -> challenge

// POST /auth/register/start
auth.post("/register/start", async (c) => {
  const body = await c.req.json<{ name: string }>();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return c.json({ error: "Name is required" }, 400);
  }

  const tempId = crypto.randomUUID();

  const options = await generateRegistrationOptions({
    rpName: config.rpName,
    rpID: config.rpID,
    userName: name.trim(),
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  challenges.set(tempId, options.challenge);

  // Clean up old challenges after 5 minutes
  setTimeout(() => challenges.delete(tempId), 5 * 60 * 1000);

  return c.json({ options, tempId });
});

// POST /auth/register/finish
auth.post("/register/finish", async (c) => {
  const body = await c.req.json<{
    tempId: string;
    name: string;
    response: RegistrationResponseJSON;
  }>();
  const { tempId, name, response } = body;

  const challenge = challenges.get(tempId);
  if (!challenge) {
    return c.json({ error: "Challenge expired or invalid" }, 400);
  }
  challenges.delete(tempId);

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: config.origin,
      expectedRPID: config.rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return c.json({ error: "Registration verification failed" }, 400);
    }

    const { credential } = verification.registrationInfo;

    // Create user
    const user = createUser(name.trim());

    // Add credential
    addCredentialToUser(user.id, {
      id: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: response.response.transports,
    });

    // Create default inventory
    const repo = getRepo();
    const handle = repo.create<InventoryDoc>();
    handle.change((doc) => {
      doc.name = "My Inventory";
      doc.items = {};
    });
    createInventoryAccess(handle.documentId, user.id);

    // Create session
    const session = createSession(user.id);
    setSessionCookie(c, session);

    return c.json({
      user: { id: user.id, name: user.name },
      inventoryId: handle.documentId,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return c.json({ error: "Registration failed" }, 500);
  }
});

// POST /auth/login/start
auth.post("/login/start", async (c) => {
  const tempId = crypto.randomUUID();

  const options = await generateAuthenticationOptions({
    rpID: config.rpID,
    userVerification: "preferred",
  });

  challenges.set(tempId, options.challenge);
  setTimeout(() => challenges.delete(tempId), 5 * 60 * 1000);

  return c.json({ options, tempId });
});

// POST /auth/login/finish
auth.post("/login/finish", async (c) => {
  const body = await c.req.json<{
    tempId: string;
    response: AuthenticationResponseJSON;
  }>();
  const { tempId, response } = body;

  const challenge = challenges.get(tempId);
  if (!challenge) {
    return c.json({ error: "Challenge expired or invalid" }, 400);
  }
  challenges.delete(tempId);

  try {
    // Find user by credential ID
    const user = getUserByCredentialId(response.id);
    if (!user) {
      return c.json({ error: "Credential not found" }, 401);
    }

    const credential = getCredentialById(user.id, response.id);
    if (!credential) {
      return c.json({ error: "Credential not found" }, 401);
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: config.origin,
      expectedRPID: config.rpID,
      credential: {
        id: credential.id,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: credential.transports,
      },
    });

    if (!verification.verified) {
      return c.json({ error: "Authentication failed" }, 401);
    }

    // Update counter
    updateCredentialCounter(
      user.id,
      credential.id,
      verification.authenticationInfo.newCounter
    );

    // Create session
    const session = createSession(user.id);
    setSessionCookie(c, session);

    const inventories = getInventoriesForUser(user.id);

    return c.json({
      user: { id: user.id, name: user.name },
      inventories: inventories.map((a) => ({
        id: a.inventoryId,
        isOwner: a.ownerId === user.id,
      })),
    });
  } catch (err) {
    console.error("Login error:", err);
    return c.json({ error: "Authentication failed" }, 500);
  }
});

// GET /auth/me
auth.get("/me", async (c) => {
  const sessionId = getCookie(c, config.sessionCookieName);
  if (!sessionId) {
    return c.json({ user: null });
  }

  const session = refreshSession(sessionId);
  if (!session) {
    clearSessionCookie(c);
    return c.json({ user: null });
  }

  const user = getUserById(session.userId);
  if (!user) {
    clearSessionCookie(c);
    return c.json({ user: null });
  }

  setSessionCookie(c, session);

  const inventories = getInventoriesForUser(user.id);

  return c.json({
    user: { id: user.id, name: user.name },
    inventories: inventories.map((a) => ({
      id: a.inventoryId,
      isOwner: a.ownerId === user.id,
    })),
  });
});

// POST /auth/logout
auth.post("/logout", async (c) => {
  const sessionId = getCookie(c, config.sessionCookieName);
  if (sessionId) {
    deleteSession(sessionId);
  }
  clearSessionCookie(c);
  return c.json({ success: true });
});

export { auth };
