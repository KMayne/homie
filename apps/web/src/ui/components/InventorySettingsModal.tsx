import { useState } from "react";
import { useAuth } from "../../auth";
import { inventoryApi } from "../../api";

interface InventorySettingsModalProps {
  onClose: () => void;
}

export function InventorySettingsModal({ onClose }: InventorySettingsModalProps) {
  const { inventories, currentInventoryId, removeInventory } = useAuth();

  const [memberUserId, setMemberUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentInventory = inventories.find((i) => i.id === currentInventoryId);
  const isOwner = currentInventory?.isOwner ?? false;
  const name = currentInventory?.name ?? "Inventory";

  const handleAddMember = async () => {
    if (!currentInventoryId || !memberUserId.trim()) {
      setError("User ID is required");
      return;
    }

    try {
      await inventoryApi.addMember(currentInventoryId, memberUserId.trim());
      setMemberUserId("");
      setError(null);
      setSuccess("Member added successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
      setSuccess(null);
    }
  };

  const handleDelete = async () => {
    if (!currentInventoryId) return;

    try {
      await inventoryApi.delete(currentInventoryId);
      removeInventory(currentInventoryId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete inventory");
    }
  };

  const handleLeave = async () => {
    // For non-owners, "leaving" is implemented by the owner removing them
    // For now, we just close - in a real app we'd need an API endpoint for this
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Inventory Settings</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <div className="inventory-settings-content">
          <div className="settings-section">
            <h3>{name}</h3>
            <p className="settings-meta">
              {isOwner ? "You own this inventory" : "Shared with you"}
            </p>
            <p className="settings-id">ID: {currentInventoryId}</p>
          </div>

          {isOwner && (
            <div className="settings-section">
              <h4>Share with others</h4>
              <p className="settings-help">
                Enter a user ID to give them access to this inventory.
              </p>

              {error && <div className="form-error">{error}</div>}
              {success && <div className="form-success">{success}</div>}

              <div className="share-form">
                <input
                  type="text"
                  value={memberUserId}
                  onChange={(e) => {
                    setMemberUserId(e.target.value);
                    setError(null);
                  }}
                  placeholder="User ID"
                  className="share-input"
                />
                <button onClick={handleAddMember} className="btn-share">
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="settings-section settings-danger-zone">
            {isOwner ? (
              <>
                <h4>Danger zone</h4>
                {showDeleteConfirm ? (
                  <div className="delete-confirm">
                    <span>Delete this inventory and all its items?</span>
                    <button onClick={handleDelete} className="btn-delete-confirm">
                      Yes, Delete
                    </button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="btn-cancel">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-delete"
                  >
                    Delete Inventory
                  </button>
                )}
              </>
            ) : (
              <>
                <h4>Leave inventory</h4>
                <p className="settings-help">
                  You'll no longer have access to this inventory.
                </p>
                <button onClick={handleLeave} className="btn-delete">
                  Leave Inventory
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
