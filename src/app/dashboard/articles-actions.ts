"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { updateArticleContent, deleteArticle, type UpdateArticleInput } from "@/lib/content";
import { logger } from "@/lib/logger";

export async function updatePublishedArticleAction(articleId: string, input: UpdateArticleInput) {
  const session = await requireRole("EDITOR");
  await updateArticleContent(articleId, input);
  logger.audit("published_article_edited", session.user.id, { articleId });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deletePublishedArticleAction(articleId: string) {
  const session = await requireRole("EDITOR");
  await deleteArticle(articleId);
  logger.audit("published_article_deleted", session.user.id, { articleId });
  revalidatePath("/", "layout");
  return { ok: true };
}
