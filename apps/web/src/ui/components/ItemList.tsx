import type { Item } from "../../domain";
import { ItemRow } from "./ItemRow";

interface ItemListProps {
  items: Item[];
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
}

export function ItemList({ items, onEditItem, onDeleteItem }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="item-list-empty">
        <p>No items found.</p>
      </div>
    );
  }

  return (
    <div className="item-list">
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
        />
      ))}
    </div>
  );
}
