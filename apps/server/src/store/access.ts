import type { InventoryAccess } from "@inventory/shared";

const accessByInventory = new Map<string, InventoryAccess>();
const inventoriesByUser = new Map<string, Set<string>>(); // userId -> Set<inventoryId>

export function createInventoryAccess(
  inventoryId: string,
  ownerId: string
): InventoryAccess {
  const access: InventoryAccess = {
    inventoryId,
    ownerId,
    memberIds: [],
  };
  accessByInventory.set(inventoryId, access);

  // Track for owner
  if (!inventoriesByUser.has(ownerId)) {
    inventoriesByUser.set(ownerId, new Set());
  }
  inventoriesByUser.get(ownerId)!.add(inventoryId);

  return access;
}

export function getInventoryAccess(
  inventoryId: string
): InventoryAccess | undefined {
  return accessByInventory.get(inventoryId);
}

export function getInventoriesForUser(userId: string): InventoryAccess[] {
  const inventoryIds = inventoriesByUser.get(userId);
  if (!inventoryIds) return [];

  const result: InventoryAccess[] = [];
  for (const id of inventoryIds) {
    const access = accessByInventory.get(id);
    if (access) {
      result.push(access);
    }
  }
  return result;
}

export function canUserAccessInventory(
  userId: string,
  inventoryId: string
): boolean {
  const access = accessByInventory.get(inventoryId);
  if (!access) return false;
  return access.ownerId === userId || access.memberIds.includes(userId);
}

export function isInventoryOwner(userId: string, inventoryId: string): boolean {
  const access = accessByInventory.get(inventoryId);
  if (!access) return false;
  return access.ownerId === userId;
}

export function addMemberToInventory(
  inventoryId: string,
  memberId: string
): boolean {
  const access = accessByInventory.get(inventoryId);
  if (!access) return false;
  if (access.memberIds.includes(memberId)) return true;

  access.memberIds.push(memberId);

  // Track for member
  if (!inventoriesByUser.has(memberId)) {
    inventoriesByUser.set(memberId, new Set());
  }
  inventoriesByUser.get(memberId)!.add(inventoryId);

  return true;
}

export function removeMemberFromInventory(
  inventoryId: string,
  memberId: string
): boolean {
  const access = accessByInventory.get(inventoryId);
  if (!access) return false;

  const index = access.memberIds.indexOf(memberId);
  if (index === -1) return false;

  access.memberIds.splice(index, 1);
  inventoriesByUser.get(memberId)?.delete(inventoryId);

  return true;
}

export function deleteInventoryAccess(inventoryId: string): boolean {
  const access = accessByInventory.get(inventoryId);
  if (!access) return false;

  // Remove from owner's list
  inventoriesByUser.get(access.ownerId)?.delete(inventoryId);

  // Remove from all members' lists
  for (const memberId of access.memberIds) {
    inventoriesByUser.get(memberId)?.delete(inventoryId);
  }

  return accessByInventory.delete(inventoryId);
}
