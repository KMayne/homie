import { useMemo } from "react";
import { filterItems, type Item, type NewItem } from "../domain";
import { useInventory } from "../sync";

/**
 * Hook to get a reactive list of all items.
 * Re-renders when items are added, updated, or removed.
 */
export function useItems(): Item[] {
  const { items } = useInventory();
  return items;
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
  addItem: (item: NewItem) => Item | null;
  updateItem: (item: Item) => void;
  removeItem: (id: string) => boolean;
} {
  const { addItem, updateItem, removeItem } = useInventory();

  return {
    addItem,
    updateItem,
    removeItem,
  };
}
