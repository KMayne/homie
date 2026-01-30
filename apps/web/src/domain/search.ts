import type { Item } from "./types";

/**
 * Determines if an item matches the given search query.
 *
 * Matches against:
 * - Item name
 * - Notes
 * - Attribute keys
 * - Attribute values
 * - Flattened location path
 *
 * Search is case-insensitive.
 */
export function itemMatchesQuery(item: Item, query: string): boolean {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Check name
  if (item.name.toLowerCase().includes(normalizedQuery)) {
    return true;
  }

  // Check notes
  if (item.notes?.toLowerCase().includes(normalizedQuery)) {
    return true;
  }

  // Check flattened location path
  const flattenedLocation = item.locationPath.join(" / ").toLowerCase();
  if (flattenedLocation.includes(normalizedQuery)) {
    return true;
  }

  // Check attribute keys and values
  for (const attr of item.attributes) {
    if (attr.key.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    if (attr.value.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
  }

  return false;
}

/**
 * Filters a list of items by the given search query.
 */
export function filterItems(items: Item[], query: string): Item[] {
  return items.filter((item) => itemMatchesQuery(item, query));
}
