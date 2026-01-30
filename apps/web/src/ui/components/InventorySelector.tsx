import { useState } from "react";
import { useAuth } from "../../auth";
import { inventoryApi } from "../../api";
import { CreateInventoryModal } from "./CreateInventoryModal";

interface InventorySelectorProps {
  onOpenSettings: () => void;
}

const NEW_INVENTORY_VALUE = "__new__";

export function InventorySelector({ onOpenSettings }: InventorySelectorProps) {
  const { inventories, currentInventoryId, setCurrentInventoryId, addInventory } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSelectChange = (value: string) => {
    if (value === NEW_INVENTORY_VALUE) {
      setShowCreateModal(true);
    } else {
      setCurrentInventoryId(value);
    }
  };

  const handleCreate = async (name: string) => {
    const { inventory } = await inventoryApi.create(name);
    addInventory(inventory);
  };

  return (
    <div className="inventory-selector">
      <div className="inventory-current">
        <select
          value={currentInventoryId ?? ""}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="inventory-select"
        >
          {inventories.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.name}{inv.isOwner ? "" : " (shared)"}
            </option>
          ))}
          <option value={NEW_INVENTORY_VALUE}>New inventory...</option>
        </select>

        <button
          onClick={onOpenSettings}
          className="btn-inventory-settings"
          title="Inventory settings"
          disabled={!currentInventoryId}
        >
          Settings
        </button>
      </div>

      {showCreateModal && (
        <CreateInventoryModal
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
