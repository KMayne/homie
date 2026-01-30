import type { Item, NewItem } from "../domain";

/**
 * Repository interface for item storage.
 *
 * This abstraction allows the storage implementation to be swapped without
 * affecting the UI layer. Implementations could include:
 * - In-memory storage (current)
 * - SQLite via better-sqlite3 or sql.js
 * - REST API client
 * - IndexedDB for browser persistence
 *
 * All methods are synchronous for now. When implementing async storage,
 * create an AsyncItemRepository interface with Promise-returning methods.
 */
export interface ItemRepository {
  /**
   * Returns all items in the repository.
   */
  list(): Item[];

  /**
   * Searches items by query string.
   * The search implementation is delegated to the repository to allow
   * for storage-specific optimizations (e.g., SQLite FTS).
   */
  search(query: string): Item[];

  /**
   * Adds a new item to the repository.
   * The repository assigns the item's id.
   */
  add(item: NewItem): Item;

  /**
   * Updates an existing item.
   * Throws if the item doesn't exist.
   */
  update(item: Item): void;

  /**
   * Retrieves a single item by id.
   * Returns undefined if not found.
   */
  get(id: string): Item | undefined;

  /**
   * Removes an item by id.
   * Returns true if the item was removed, false if not found.
   */
  remove(id: string): boolean;
}
