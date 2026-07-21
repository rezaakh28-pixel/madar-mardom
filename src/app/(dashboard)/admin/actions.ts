"use server";

import type { UserRole } from "@/types";
import { logger } from "@/lib/logger";

/** Mock persistence — swap for `db.user.update(...)` once auth/DB is wired up. */
export async function updateUserRoleAction(userId: string, role: UserRole) {
  logger.audit("user_role_changed", "usr_demo_admin", { userId, role });
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true };
}

export async function toggleUserActiveAction(userId: string, isActive: boolean) {
  logger.audit("user_active_toggled", "usr_demo_admin", { userId, isActive });
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true };
}
