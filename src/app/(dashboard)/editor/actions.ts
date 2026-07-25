"use server";

import { requireRole } from "@/lib/session";
import { logger } from "@/lib/logger";

/** Mock editorial actions — swap bodies for `db.article.update(...)` calls once articles are DB-backed. */
export async function approveArticleAction(articleId: string, publishAt?: string) {
  const editor = await requireRole("EDITOR");
  logger.audit("article_approved", editor.user.id, { articleId, publishAt });
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true };
}

export async function rejectArticleAction(articleId: string, reason: string) {
  const editor = await requireRole("EDITOR");
  logger.audit("article_rejected", editor.user.id, { articleId, reason });
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true };
}

export async function restoreRevisionAction(articleId: string, revisionId: string) {
  const editor = await requireRole("EDITOR");
  logger.audit("article_revision_restored", editor.user.id, { articleId, revisionId });
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true };
}
