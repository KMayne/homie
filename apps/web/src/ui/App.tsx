import { useState } from "react";
import { useAuth } from "../auth";
import { useSearchItems, useItemMutations } from "../store";
import { SearchBar, ItemList, AddItemModal } from "./components";

export function App() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const items = useSearchItems(searchQuery);
  const { addItem } = useItemMutations();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Ignore logout errors
    }
  }

  return (
    <div className="app">
      <header className="app-header user-header">
        <h1>Home Inventory</h1>
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Sign out
          </button>
        </div>
      </header>

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

        <ItemList items={items} />
      </main>

      {showAddModal && (
        <AddItemModal
          onSave={addItem}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
