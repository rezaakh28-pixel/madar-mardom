"use server";

import {
  suggestTitle,
  suggestTags,
  suggestCategory,
  summarizeArticle,
  detectDuplicate,
} from "@/lib/ai";
import { requireRole } from "@/lib/session";
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

/** Mock persistence — swap for `db.article.create(...)` / `db.article.update(...)` later. */
export async function saveArticleAction(input: SaveArticleInput) {
  const reporter = await requireRole("REPORTER");
  logger.audit("article_saved", reporter.user.id, {
    status: input.action === "draft" ? "DRAFT" : "PENDING_REVIEW",
    title: input.title,
    coverImageUrl: input.coverImageUrl,
  });
  // Simulate DB write latency.
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true };
}
