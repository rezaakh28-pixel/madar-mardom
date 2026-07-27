"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { publishArticleNow, scheduleArticle, rejectArticle, updateArticleContent } from "@/lib/content";
import { logger } from "@/lib/logger";
import type { UpdateArticleInput } from "@/lib/content";

export async function publishNowAction(articleId: string) {
  const editor = await requireRole("EDITOR");
  await publishArticleNow(articleId);
  logger.audit("article_published_now", editor.user.id, { articleId });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function scheduleArticleAction(articleId: string, publishAtIso: string) {
  const editor = await requireRole("EDITOR");
  const publishAt = new Date(publishAtIso);
  if (Number.isNaN(publishAt.getTime())) {
    return { ok: false, error: "تاریخ انتشار نامعتبر است." };
  }
  await scheduleArticle(articleId, publishAt);
  logger.audit("article_scheduled", editor.user.id, { articleId, publishAt: publishAt.toISOString() });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function rejectArticleAction(articleId: string, reason: string) {
  const editor = await requireRole("EDITOR");
  await rejectArticle(articleId, reason);
  logger.audit("article_rejected", editor.user.id, { articleId, reason });
  revalidatePath("/dashboard/editor");
  return { ok: true };
}

export async function updateArticleAction(articleId: string, input: UpdateArticleInput) {
  const editor = await requireRole("EDITOR");
  await updateArticleContent(articleId, input);
  logger.audit("article_edited_by_editor", editor.user.id, { articleId });
  revalidatePath("/dashboard/editor");
  return { ok: true };
}

/** Version history isn't populated yet (no revisions are recorded on save), so this is a logged no-op for now. */
export async function restoreRevisionAction(articleId: string, revisionId: string) {
  const editor = await requireRole("EDITOR");
  logger.audit("article_revision_restore_requested", editor.user.id, { articleId, revisionId });
  return { ok: true };
}
