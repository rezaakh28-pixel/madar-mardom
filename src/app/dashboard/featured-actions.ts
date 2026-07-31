"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { setFeaturedArticle, clearFeaturedArticle } from "@/lib/content";
import { logger } from "@/lib/logger";

export async function setFeaturedArticleAction(articleId: string) {
  const session = await requireRole("EDITOR");
  await setFeaturedArticle(articleId);
  logger.audit("featured_article_set", session.user.id, { articleId });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function clearFeaturedArticleAction() {
  const session = await requireRole("EDITOR");
  await clearFeaturedArticle();
  logger.audit("featured_article_cleared", session.user.id, {});
  revalidatePath("/", "layout");
  return { ok: true };
}
