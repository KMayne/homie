import { useState } from "react";
import type { Item } from "../../domain";

interface ItemDetailsProps {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemDetails({ item, onEdit, onDelete }: ItemDetailsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="item-details">
      {item.notes && (
        <div className="item-notes">
          <strong>Notes:</strong>
          <p>{item.notes}</p>
        </div>
      )}

      {item.attributes.length > 0 && (
        <div className="item-attributes">
          <strong>Attributes:</strong>
          <table className="attributes-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {item.attributes.map((attr) => (
                <tr key={attr.id}>
                  <td>{attr.key}</td>
                  <td>{attr.type}</td>
                  <td>
                    {attr.type === "file" ? (
                      <span className="file-label">{attr.value}</span>
                    ) : (
                      attr.value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!item.notes && item.attributes.length === 0 && (
        <p className="no-details">No additional details.</p>
      )}

      <div className="item-actions">
        {showDeleteConfirm ? (
          <div className="delete-confirm">
            <span>Delete this item?</span>
            <button className="btn-delete-confirm" onClick={onDelete}>
              Yes, Delete
            </button>
            <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button className="btn-item-edit" onClick={onEdit}>
              Edit
            </button>
            <button className="btn-item-delete" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
