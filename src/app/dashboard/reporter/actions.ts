"use server";

import { revalidatePath } from "next/cache";
import {
  suggestTitle,
  suggestTags,
  suggestCategory,
  summarizeArticle,
  detectDuplicate,
} from "@/lib/ai";
import { requireRole } from "@/lib/session";
import { createArticle, updateArticleContent, getArticleForOwner } from "@/lib/content";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function suggestTitleAction(body: string) {
  return suggestTitle(body);
}

export async function suggestTagsAction(body: string) {
  return suggestTags(body);
}

export async function suggestCategoryAction(body: string) {
  return suggestCategory(body);
}

export async function summarizeArticleAction(body: string) {
  return summarizeArticle(body);
}

export async function checkDuplicateAction(body: string) {
  return detectDuplicate(body);
}

export interface SaveArticleInput {
  title: string;
  deck?: string;
  lead: string;
  body: string;
  category: string;
  tags: string[];
  coverImageUrl?: string;
  action: "draft" | "submit";
}

export interface SaveArticleResult {
  ok: boolean;
  error?: string;
}

export async function saveArticleAction(input: SaveArticleInput): Promise<SaveArticleResult> {
  const reporter = await requireRole("REPORTER");

  if (!input.title.trim() || !input.lead.trim() || !input.body.trim()) {
    return { ok: false, error: "تیتر، لید و متن خبر نمی‌توانند خالی باشند." };
  }

  try {
    const article = await createArticle({
      authorId: reporter.user.id,
      title: input.title.trim(),
      deck: input.deck?.trim(),
      lead: input.lead.trim(),
      body: input.body.trim(),
      categorySlug: input.category,
      tags: input.tags,
      coverImageUrl: input.coverImageUrl,
      status: input.action === "draft" ? "DRAFT" : "PENDING_REVIEW",
    });

    logger.audit("article_saved", reporter.user.id, { articleId: article.id, status: article.status });
    revalidatePath("/dashboard/reporter/drafts");
    return { ok: true };
  } catch (err) {
    logger.error("article_save_failed", { message: err instanceof Error ? err.message : String(err) });
    return { ok: false, error: "ذخیره خبر با خطا مواجه شد. اگر پایگاه‌داده هنوز وصل نشده، ابتدا آن را طبق README راه‌اندازی کنید." };
  }
}

export interface UpdateDraftInput {
  title: string;
  deck?: string;
  lead: string;
  body: string;
  category: string;
  tags: string[];
  coverImageUrl?: string;
  action: "draft" | "submit";
}

export async function updateDraftAction(articleId: string, input: UpdateDraftInput): Promise<SaveArticleResult> {
  const reporter = await requireRole("REPORTER");

  const owned = await getArticleForOwner(articleId, reporter.user.id);
  if (!owned) return { ok: false, error: "این خبر یافت نشد یا متعلق به شما نیست." };
  if (owned.status === "PUBLISHED") return { ok: false, error: "خبر منتشرشده از این صفحه قابل ویرایش نیست." };

  if (!input.title.trim() || !input.lead.trim() || !input.body.trim()) {
    return { ok: false, error: "تیتر، لید و متن خبر نمی‌توانند خالی باشند." };
  }

  try {
    await updateArticleContent(articleId, {
      title: input.title.trim(),
      deck: input.deck?.trim(),
      lead: input.lead.trim(),
      body: input.body.trim(),
      categorySlug: input.category,
      tags: input.tags,
      coverImageUrl: input.coverImageUrl,
    });
    await db.article.update({
      where: { id: articleId },
      data: { status: input.action === "draft" ? "DRAFT" : "PENDING_REVIEW" },
    });

    logger.audit("draft_updated", reporter.user.id, { articleId, action: input.action });
    revalidatePath("/dashboard/reporter/drafts");
    return { ok: true };
  } catch (err) {
    logger.error("draft_update_failed", { message: err instanceof Error ? err.message : String(err) });
    return { ok: false, error: "ذخیره تغییرات با خطا مواجه شد." };
  }
}

export async function deleteDraftAction(articleId: string) {
  const reporter = await requireRole("REPORTER");
  const owned = await getArticleForOwner(articleId, reporter.user.id);
  if (!owned) return { ok: false, error: "این خبر یافت نشد یا متعلق به شما نیست." };
  if (owned.status === "PUBLISHED") return { ok: false, error: "خبر منتشرشده قابل حذف نیست." };

  await db.article.delete({ where: { id: articleId } });
  logger.audit("draft_deleted", reporter.user.id, { articleId });
  revalidatePath("/dashboard/reporter/drafts");
  return { ok: true };
}
