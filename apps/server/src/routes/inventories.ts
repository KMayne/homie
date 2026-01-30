import { Hono } from "hono";
import { type Env, requireAuth } from "../app.ts";
import {
  createInventoryAccess,
  getInventoriesForUser,
  getInventoryAccess,
  isInventoryOwner,
  canUserAccessInventory,
  addMemberToInventory,
  removeMemberFromInventory,
  deleteInventoryAccess,
} from "../store/index.ts";
import { getRepo } from "../repo.ts";
import type { InventoryDoc } from "@inventory/shared";

const inventories = new Hono<Env>();

// All routes require auth
inventories.use("*", requireAuth());

// GET /api/inventories
inventories.get("/", (c) => {
  const user = c.get("user");
  const userInventories = getInventoriesForUser(user.id);

  return c.json({
    inventories: userInventories.map((a) => ({
      id: a.inventoryId,
      isOwner: a.ownerId === user.id,
    })),
  });
});

// POST /api/inventories
inventories.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ name?: string }>();
  const name = body.name?.trim() || "New Inventory";

  const repo = getRepo();
  const handle = repo.create<InventoryDoc>();
  handle.change((doc) => {
    doc.name = name;
    doc.items = {};
  });

  createInventoryAccess(handle.documentId, user.id);

  return c.json({
    inventory: {
      id: handle.documentId,
      isOwner: true,
    },
  });
});

// DELETE /api/inventories/:id
inventories.delete("/:id", async (c) => {
  const user = c.get("user");
  const inventoryId = c.req.param("id");

  if (!isInventoryOwner(user.id, inventoryId)) {
    return c.json({ error: "Only the owner can delete an inventory" }, 403);
  }

  deleteInventoryAccess(inventoryId);

  // Note: We're not deleting the Automerge document itself
  // In a real app, you might want to mark it as deleted or archive it

  return c.json({ success: true });
});

// POST /api/inventories/:id/members
inventories.post("/:id/members", async (c) => {
  const user = c.get("user");
  const inventoryId = c.req.param("id");

  if (!isInventoryOwner(user.id, inventoryId)) {
    return c.json({ error: "Only the owner can add members" }, 403);
  }

  const body = await c.req.json<{ userId: string }>();
  const { userId } = body;

  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  const success = addMemberToInventory(inventoryId, userId);
  if (!success) {
    return c.json({ error: "Inventory not found" }, 404);
  }

  return c.json({ success: true });
});

// DELETE /api/inventories/:id/members/:uid
inventories.delete("/:id/members/:uid", async (c) => {
  const user = c.get("user");
  const inventoryId = c.req.param("id");
  const memberId = c.req.param("uid");

  if (!isInventoryOwner(user.id, inventoryId)) {
    return c.json({ error: "Only the owner can remove members" }, 403);
  }

  const success = removeMemberFromInventory(inventoryId, memberId);
  if (!success) {
    return c.json({ error: "Member not found" }, 404);
  }

  return c.json({ success: true });
});

export { inventories };
