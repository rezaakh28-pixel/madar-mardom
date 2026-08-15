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
  coverImageOrientation?: "landscape" | "portrait";
  coverImagePosition?: string;
  /** Photo-report ("گزارش تصویری") image URLs — required (12–34) instead of body text when category is "infographic". */
  galleryImages?: string[];
  action: "draft" | "submit";
}

export interface SaveArticleResult {
  ok: boolean;
  error?: string;
}

const PHOTO_REPORT_CATEGORY = "infographic";
const PHOTO_REPORT_MIN_IMAGES = 12;
const PHOTO_REPORT_MAX_IMAGES = 34;

/** Shared validation for both new articles and draft edits — see the "گزارش تصویری" (photo report) rules on PHOTO_REPORT_CATEGORY above. */
function validateArticleInput(
  input: { title: string; lead: string; body: string; category: string; galleryImages?: string[] },
  action: "draft" | "submit"
): string | null {
  if (!input.title.trim() || !input.lead.trim()) {
    return "تیتر و لید نمی‌توانند خالی باشند.";
  }

  if (input.category === PHOTO_REPORT_CATEGORY) {
    const count = input.galleryImages?.length ?? 0;
    if (count > PHOTO_REPORT_MAX_IMAGES) {
      return `برای گزارش تصویری حداکثر ${PHOTO_REPORT_MAX_IMAGES} تصویر می‌توانید بارگذاری کنید.`;
    }
    if (action === "submit" && (count < PHOTO_REPORT_MIN_IMAGES || count > PHOTO_REPORT_MAX_IMAGES)) {
      return `برای گزارش تصویری باید بین ${PHOTO_REPORT_MIN_IMAGES} تا ${PHOTO_REPORT_MAX_IMAGES} تصویر بارگذاری کنید.`;
    }
  } else if (!input.body.trim()) {
    return "متن خبر نمی‌تواند خالی باشد.";
  }

  return null;
}

export async function saveArticleAction(input: SaveArticleInput): Promise<SaveArticleResult> {
  const reporter = await requireRole("REPORTER");

  const validationError = validateArticleInput(input, input.action);
  if (validationError) {
    return { ok: false, error: validationError };
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
      coverImageOrientation: input.coverImageOrientation,
      coverImagePosition: input.coverImagePosition,
      galleryImages: input.category === PHOTO_REPORT_CATEGORY ? input.galleryImages : undefined,
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
  coverImageOrientation?: "landscape" | "portrait";
  coverImagePosition?: string;
  /** Photo-report ("گزارش تصویری") image URLs — required (12–34) instead of body text when category is "infographic". */
  galleryImages?: string[];
  action: "draft" | "submit";
}

export async function updateDraftAction(articleId: string, input: UpdateDraftInput): Promise<SaveArticleResult> {
  const reporter = await requireRole("REPORTER");

  const owned = await getArticleForOwner(articleId, reporter.user.id);
  if (!owned) return { ok: false, error: "این خبر یافت نشد یا متعلق به شما نیست." };
  if (owned.status === "PUBLISHED") return { ok: false, error: "خبر منتشرشده از این صفحه قابل ویرایش نیست." };

  const validationError = validateArticleInput(input, input.action);
  if (validationError) {
    return { ok: false, error: validationError };
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
      coverImageOrientation: input.coverImageOrientation,
      coverImagePosition: input.coverImagePosition,
      galleryImages: input.category === PHOTO_REPORT_CATEGORY ? (input.galleryImages ?? []) : [],
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
