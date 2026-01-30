import { useState } from "react";
import { useSearchItems, useItemMutations } from "../store";
import { SearchBar, ItemList, AddItemModal } from "./components";

export function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const items = useSearchItems(searchQuery);
  const { addItem } = useItemMutations();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Home Inventory</h1>
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
