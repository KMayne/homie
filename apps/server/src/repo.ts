import { Repo } from "@automerge/automerge-repo";
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs";
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket";
import type { WebSocketServer } from "ws";
import { config } from "./config.ts";

let repo: Repo | null = null;

export function createRepo(wss: WebSocketServer): Repo {
  if (repo) {
    return repo;
  }

  repo = new Repo({
    storage: new NodeFSStorageAdapter(config.dataDir),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    network: [new NodeWSServerAdapter(wss as any)],
  });

  return repo;
}

export function getRepo(): Repo {
  if (!repo) {
    throw new Error("Repo not initialized. Call createRepo first.");
  }
  return repo;
}
