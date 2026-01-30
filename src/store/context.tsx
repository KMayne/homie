import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { filterItems, type Item, type NewItem } from "../domain";
import type { ItemRepository } from "./repository";
import { InMemoryItemRepository } from "./memory";

/**
 * Context for accessing the item repository.
 * Components use this to read/write items without knowing the storage implementation.
 */
const RepositoryContext = createContext<ItemRepository | null>(null);

/**
 * Context for the subscription-enabled repository (for reactive updates).
 */
const SubscribableRepositoryContext =
  createContext<InMemoryItemRepository | null>(null);

interface RepositoryProviderProps {
  repository: InMemoryItemRepository;
  children: ReactNode;
}

/**
 * Provides the item repository to the component tree.
 *
 * Usage:
 * ```tsx
 * const repository = createInMemoryRepository();
 * <RepositoryProvider repository={repository}>
 *   <App />
 * </RepositoryProvider>
 * ```
 */
export function RepositoryProvider({
  repository,
  children,
}: RepositoryProviderProps) {
  return (
    <RepositoryContext.Provider value={repository}>
      <SubscribableRepositoryContext.Provider value={repository}>
        {children}
      </SubscribableRepositoryContext.Provider>
    </RepositoryContext.Provider>
  );
}

/**
 * Hook to access the item repository.
 * Throws if used outside of a RepositoryProvider.
 */
export function useRepository(): ItemRepository {
  const repository = useContext(RepositoryContext);
  if (!repository) {
    throw new Error("useRepository must be used within a RepositoryProvider");
  }
  return repository;
}

/**
 * Hook to get a reactive list of all items.
 * Re-renders when items are added, updated, or removed.
 */
export function useItems(): Item[] {
  const repository = useContext(SubscribableRepositoryContext);
  if (!repository) {
    throw new Error("useItems must be used within a RepositoryProvider");
  }

  return useSyncExternalStore(
    (callback) => repository.subscribe(callback),
    () => repository.list()
  );
}

/**
 * Hook to get a reactive list of items matching a search query.
 * Re-renders when items change or the query would produce different results.
 */
export function useSearchItems(query: string): Item[] {
  const items = useItems();

  return useMemo(() => filterItems(items, query), [items, query]);
}

/**
 * Hook providing item mutation operations.
 * Returns stable functions that don't change between renders.
 */
export function useItemMutations(): {
  addItem: (item: NewItem) => Item;
  updateItem: (item: Item) => void;
  removeItem: (id: string) => boolean;
} {
  const repository = useRepository();

  return {
    addItem: (item: NewItem) => repository.add(item),
    updateItem: (item: Item) => repository.update(item),
    removeItem: (id: string) => repository.remove(id),
  };
}
