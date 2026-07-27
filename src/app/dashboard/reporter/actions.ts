"use server";

import {
  suggestTitle,
  suggestTags,
  suggestCategory,
  summarizeArticle,
  detectDuplicate,
} from "@/lib/ai";
import { requireRole } from "@/lib/session";
import { createArticle } from "@/lib/content";
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
    return { ok: true };
  } catch (err) {
    logger.error("article_save_failed", { message: err instanceof Error ? err.message : String(err) });
    return { ok: false, error: "ذخیره خبر با خطا مواجه شد. اگر پایگاه‌داده هنوز وصل نشده، ابتدا آن را طبق README راه‌اندازی کنید." };
  }
}
