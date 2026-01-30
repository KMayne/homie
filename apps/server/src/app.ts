import { Hono, type Context, type Next, type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { config } from "./config.ts";
import { refreshSession, deleteSession } from "./store/index.ts";
import type { Session, User } from "@inventory/shared";
import { getUserById } from "./store/index.ts";

// Extend Hono context with our variables
export interface Env {
  Variables: {
    session: Session;
    user: User;
  };
}

export const app = new Hono<Env>();

// CORS for frontend
app.use(
  "*",
  cors({
    origin: config.origin,
    credentials: true,
  })
);

// Auth middleware helper
export const requireAuth = (): MiddlewareHandler<Env> => {
  return async (c, next) => {
    const sessionId = getCookie(c, config.sessionCookieName);
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = refreshSession(sessionId);
    if (!session) {
      deleteCookie(c, config.sessionCookieName);
      return c.json({ error: "Session expired" }, 401);
    }

    const user = getUserById(session.userId);
    if (!user) {
      deleteCookie(c, config.sessionCookieName);
      return c.json({ error: "User not found" }, 401);
    }

    c.set("session", session);
    c.set("user", user);

    // Update session cookie with new expiry
    setSessionCookie(c, session);

    await next();
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setSessionCookie(c: Context<any>, session: Session) {
  setCookie(c, config.sessionCookieName, session.id, {
    httpOnly: true,
    secure: config.origin.startsWith("https"),
    sameSite: "Lax",
    maxAge: config.sessionMaxAge / 1000, // seconds
    path: "/",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function clearSessionCookie(c: Context<any>) {
  deleteCookie(c, config.sessionCookieName, {
    path: "/",
  });
}
