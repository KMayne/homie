import { app } from "./app.ts";
import { config } from "./config.ts";
import { createRepo } from "./repo.ts";
import { setupWebSocketSync } from "./ws/sync.ts";

// Start server
const server = app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`WebSocket sync available at ws://localhost:${config.port}/sync`);
});

// Setup WebSocket for Automerge sync
const wss = setupWebSocketSync(server);

// Initialize Automerge repo with WebSocket adapter
createRepo(wss);
