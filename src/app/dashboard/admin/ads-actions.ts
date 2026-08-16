"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { createAd, deleteAd, setAdActive, reorderAd } from "@/lib/ads";
import { logger } from "@/lib/logger";

function revalidateAdPaths() {
  revalidatePath("/dashboard/admin/ads");
  revalidatePath("/", "layout");
}

export interface CreateAdActionInput {
  title: string;
  imageUrl: string;
  linkUrl: string;
}

export async function createAdAction(input: CreateAdActionInput) {
  const session = await requireRole("ADMIN");

  if (!input.title.trim() || !input.imageUrl.trim() || !input.linkUrl.trim()) {
    return { ok: false, error: "عنوان، تصویر و لینک نمی‌توانند خالی باشند." };
  }
  try {
    const url = new URL(input.linkUrl.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("invalid protocol");
  } catch {
    return { ok: false, error: "لینک وارد شده معتبر نیست." };
  }

  await createAd({ title: input.title.trim(), imageUrl: input.imageUrl, linkUrl: input.linkUrl.trim() });
  logger.audit("ad_created", session.user.id, {});
  revalidateAdPaths();
  return { ok: true };
}

export async function toggleAdActiveAction(id: string, isActive: boolean) {
  const session = await requireRole("ADMIN");
  await setAdActive(id, isActive);
  logger.audit("ad_toggled", session.user.id, { id, isActive });
  revalidateAdPaths();
  return { ok: true };
}

export async function deleteAdAction(id: string) {
  const session = await requireRole("ADMIN");
  await deleteAd(id);
  logger.audit("ad_deleted", session.user.id, { id });
  revalidateAdPaths();
  return { ok: true };
}

export async function reorderAdAction(id: string, direction: "up" | "down") {
  const session = await requireRole("ADMIN");
  await reorderAd(id, direction);
  logger.audit("ad_reordered", session.user.id, { id, direction });
  revalidateAdPaths();
  return { ok: true };
}
