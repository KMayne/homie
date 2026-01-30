import { serve } from "@hono/node-server";
import type { Server } from "node:http";
import { app } from "./app.ts";
import { auth } from "./routes/auth.ts";
import { inventories } from "./routes/inventories.ts";
import { setupWebSocketSync } from "./ws/sync.ts";
import { createRepo } from "./repo.ts";
import { config } from "./config.ts";

// Mount routes
app.route("/auth", auth);
app.route("/api/inventories", inventories);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Start server
const server = serve({
  fetch: app.fetch,
  port: config.port,
}) as Server;

// Setup WebSocket for Automerge sync
const wss = setupWebSocketSync(server);

// Initialize Automerge repo with WebSocket adapter
createRepo(wss);

console.log(`Server running on http://localhost:${config.port}`);
console.log(`WebSocket sync available at ws://localhost:${config.port}/sync`);
