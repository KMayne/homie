import { useState } from "react";
import type { Item } from "../../domain";
import { ItemDetails } from "./ItemDetails";

interface ItemRowProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

function formatLocationPath(path: string[]): string {
  if (path.length === 0) {
    return "—";
  }
  return path.join(" / ");
}

export function ItemRow({ item, onEdit, onDelete }: ItemRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="item-row">
      <div
        className="item-row-header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <span className="item-expand-icon">{expanded ? "▼" : "▶"}</span>
        <span className="item-name">{item.name}</span>
        <span className="item-quantity">×{item.quantity}</span>
        <span className="item-location">{formatLocationPath(item.locationPath)}</span>
      </div>

      {expanded && (
        <ItemDetails
          item={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
        />
      )}
    </div>
  );
}
