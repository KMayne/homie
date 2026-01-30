import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { Repo, type DocumentId } from "@automerge/automerge-repo";
import { RepoContext } from "@automerge/react";
import { getRepo } from "./repo";
import { useAuth } from "../auth";

interface SyncContextValue {
  repo: Repo;
  inventoryId: DocumentId | null;
}

const SyncContext = createContext<SyncContextValue | null>(null);

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const { currentInventoryId } = useAuth();
  const repo = useMemo(() => getRepo(), []);

  const inventoryId = currentInventoryId as DocumentId | null;

  return (
    <RepoContext.Provider value={repo}>
      <SyncContext.Provider value={{ repo, inventoryId }}>
        {children}
      </SyncContext.Provider>
    </RepoContext.Provider>
  );
}

export function useSync(): SyncContextValue {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}

export function useInventoryId(): DocumentId | null {
  const { inventoryId } = useSync();
  return inventoryId;
}
