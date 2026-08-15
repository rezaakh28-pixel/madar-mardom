"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { setFeaturedArticleRank, clearFeaturedRank } from "@/lib/content";
import { logger } from "@/lib/logger";

export async function setFeaturedArticleAction(articleId: string, rank: 1 | 2 | 3) {
  const session = await requireRole("EDITOR");
  await setFeaturedArticleRank(articleId, rank);
  logger.audit("featured_article_set", session.user.id, { articleId, rank });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function clearFeaturedArticleAction(rank: 1 | 2 | 3) {
  const session = await requireRole("EDITOR");
  await clearFeaturedRank(rank);
  logger.audit("featured_article_cleared", session.user.id, { rank });
  revalidatePath("/", "layout");
  return { ok: true };
}
