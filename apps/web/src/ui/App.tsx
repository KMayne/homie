import { useState } from "react";
import { useAuth } from "../auth";
import { useSearchItems, useItemMutations } from "../store";
import {
  SearchBar,
  ItemList,
  AddItemModal,
  EditItemModal,
  InventorySelector,
  InventorySettingsModal,
} from "./components";
import type { Item } from "../domain";

export function App() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showInventorySettings, setShowInventorySettings] = useState(false);

  const items = useSearchItems(searchQuery);
  const { addItem, updateItem, removeItem } = useItemMutations();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Ignore logout errors
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Home Inventory</h1>
        </div>
        <div className="header-right">
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Sign out
          </button>
        </div>
      </header>

      <div className="inventory-bar">
        <InventorySelector onOpenSettings={() => setShowInventorySettings(true)} />
      </div>

      <main className="app-main">
        <div className="toolbar">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-add-item"
          >
            + Add Item
          </button>
        </div>

        <ItemList
          items={items}
          onEditItem={setEditingItem}
          onDeleteItem={removeItem}
        />
      </main>

      {showAddModal && (
        <AddItemModal
          onSave={addItem}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onSave={updateItem}
          onDelete={removeItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      {showInventorySettings && (
        <InventorySettingsModal onClose={() => setShowInventorySettings(false)} />
      )}
    </div>
  );
}
