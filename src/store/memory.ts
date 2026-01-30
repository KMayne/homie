import type { Item, NewItem } from "../domain";
import { filterItems } from "../domain";
import type { ItemRepository } from "./repository";

/**
 * Generates a unique ID for new items.
 * In a real implementation, this might come from the database or use UUIDs.
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * In-memory implementation of ItemRepository.
 *
 * This implementation stores items in a Map for O(1) lookups.
 * Data is lost when the page refreshes.
 *
 * To replace with persistent storage:
 * 1. Create a new class implementing ItemRepository
 * 2. Implement methods to read/write from SQLite, API, etc.
 * 3. Swap the implementation in the repository context provider
 */
export class InMemoryItemRepository implements ItemRepository {
  private items: Map<string, Item> = new Map();
  private listeners: Set<() => void> = new Set();

  // Cached list for stable references (required by useSyncExternalStore)
  private cachedList: Item[] = [];
  private listVersion = 0;

  /**
   * Subscribe to changes in the repository.
   * Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private invalidateCache(): void {
    this.listVersion++;
    this.cachedList = Array.from(this.items.values());
  }

  private notify(): void {
    this.invalidateCache();
    this.listeners.forEach((listener) => listener());
  }

  list(): Item[] {
    return this.cachedList;
  }

  search(query: string): Item[] {
    return filterItems(this.cachedList, query);
  }

  add(newItem: NewItem): Item {
    const item: Item = {
      ...newItem,
      id: generateId(),
    };
    this.items.set(item.id, item);
    this.notify();
    return item;
  }

  update(item: Item): void {
    if (!this.items.has(item.id)) {
      throw new Error(`Item with id ${item.id} not found`);
    }
    this.items.set(item.id, item);
    this.notify();
  }

  get(id: string): Item | undefined {
    return this.items.get(id);
  }

  remove(id: string): boolean {
    const deleted = this.items.delete(id);
    if (deleted) {
      this.notify();
    }
    return deleted;
  }

  /**
   * Seeds the repository with sample data for development.
   */
  seed(items: NewItem[]): void {
    for (const item of items) {
      this.add(item);
    }
  }
}

/**
 * Factory function to create a new in-memory repository.
 */
export function createInMemoryRepository(): InMemoryItemRepository {
  return new InMemoryItemRepository();
}
