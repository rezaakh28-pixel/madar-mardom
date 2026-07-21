"use server";

import { logger } from "@/lib/logger";

/** Mock editorial actions — swap bodies for `db.article.update(...)` calls later. */
export async function approveArticleAction(articleId: string, publishAt?: string) {
  logger.audit("article_approved", "usr_demo_editor", { articleId, publishAt });
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true };
}

export async function rejectArticleAction(articleId: string, reason: string) {
  logger.audit("article_rejected", "usr_demo_editor", { articleId, reason });
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true };
}

export async function restoreRevisionAction(articleId: string, revisionId: string) {
  logger.audit("article_revision_restored", "usr_demo_editor", { articleId, revisionId });
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true };
}
