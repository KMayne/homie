import { useState } from "react";

interface CreateInventoryModalProps {
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}

export function CreateInventoryModal({ onSave, onClose }: CreateInventoryModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create inventory");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Inventory</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="inventory-name">Name</label>
            <input
              id="inventory-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Enter inventory name"
              autoFocus
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
