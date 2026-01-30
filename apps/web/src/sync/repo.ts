import { Repo } from "@automerge/automerge-repo";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";

function getWsUrl(): string {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  // Use relative WebSocket URL (works with Vite proxy in dev, same-origin in prod)
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/sync`;
}

let repo: Repo | null = null;

export function getRepo(): Repo {
  if (!repo) {
    repo = new Repo({
      storage: new IndexedDBStorageAdapter(),
      network: [new BrowserWebSocketClientAdapter(getWsUrl())],
    });
  }
  return repo;
}
