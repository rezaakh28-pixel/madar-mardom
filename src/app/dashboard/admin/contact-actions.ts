"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { markContactMessageRead, deleteContactMessage } from "@/lib/contact";
import { logger } from "@/lib/logger";

export async function markContactMessageReadAction(id: string) {
  const session = await requireRole("ADMIN");
  await markContactMessageRead(id);
  logger.audit("contact_message_read", session.user.id, { id });
  revalidatePath("/dashboard/admin/contact");
  return { ok: true };
}

export async function deleteContactMessageAction(id: string) {
  const session = await requireRole("ADMIN");
  await deleteContactMessage(id);
  logger.audit("contact_message_deleted", session.user.id, { id });
  revalidatePath("/dashboard/admin/contact");
  return { ok: true };
}
