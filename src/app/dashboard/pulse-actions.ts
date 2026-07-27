"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { upsertPulseItem, type UpdatePulseItemInput } from "@/lib/pulse";
import { logger } from "@/lib/logger";

async function requirePulseEditor() {
  const session = await getSession();
  if (!session) throw new Error("دسترسی غیرمجاز.");

  const isAdmin = session.user.role === "ADMIN";
  const isEconomyEditor =
    session.user.role === "EDITOR" && (session.user.beatCategorySlugs ?? []).includes("economy");

  if (!isAdmin && !isEconomyEditor) throw new Error("دسترسی غیرمجاز.");
  return session;
}

export interface UpdatePulseState {
  error?: string;
  success?: boolean;
}

export async function updatePulseItemsAction(items: UpdatePulseItemInput[]): Promise<UpdatePulseState> {
  try {
    const session = await requirePulseEditor();
    for (const item of items) {
      await upsertPulseItem(item);
    }
    logger.audit("pulse_items_updated", session.user.id, { count: items.length });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "به‌روزرسانی با خطا مواجه شد." };
  }
}
