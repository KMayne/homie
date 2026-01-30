import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createInMemoryRepository, RepositoryProvider } from "./store";
import { App } from "./ui/App";
import "./index.css";

// Create the repository instance.
// To switch to a different storage backend:
// 1. Create a class implementing ItemRepository (e.g., SQLiteRepository)
// 2. Replace createInMemoryRepository() with your implementation
const repository = createInMemoryRepository();

// Seed with sample data for development
repository.seed([
  {
    name: "M Wallet",
    quantity: 1,
    notes: "Black leather bifold wallet",
    locationPath: ["Living Room", "TV Stand", "Drawer", "Holiday"],
    attributes: [
      { id: "1", key: "Brand", type: "text", value: "Montblanc" },
      { id: "2", key: "Purchase Date", type: "date", value: "2023-06-15" },
    ],
  },
  {
    name: "Wireless Keyboard",
    quantity: 1,
    notes: "Logitech MX Keys, pairs with 3 devices",
    locationPath: ["Office", "Desk"],
    attributes: [
      { id: "3", key: "Model", type: "text", value: "MX Keys" },
      { id: "4", key: "Manual", type: "file", value: "mx-keys-manual.pdf" },
    ],
  },
  {
    name: "AA Batteries",
    quantity: 24,
    locationPath: ["Kitchen", "Utility Drawer"],
    attributes: [
      { id: "5", key: "Type", type: "text", value: "Alkaline" },
    ],
  },
  {
    name: "Christmas Lights",
    quantity: 3,
    notes: "LED string lights, 100ft each",
    locationPath: ["Garage", "Storage Shelf", "Holiday Box"],
    attributes: [
      { id: "6", key: "Color", type: "text", value: "Warm White" },
      { id: "7", key: "Length", type: "number", value: "100" },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RepositoryProvider repository={repository}>
      <App />
    </RepositoryProvider>
  </StrictMode>
);
