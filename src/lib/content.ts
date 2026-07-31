import { db } from "@/lib/db";
import { getCategoryBySlug } from "@/lib/mock-data";
import { readingTime } from "@/lib/utils";
import { ROLE_LABELS_FA } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import type { Article, User } from "@prisma/client";
import type { Author, Category, MediaAsset, NewsArticle, SiteStats, SpecialCase } from "@/types";

// ---------------------------------------------------------------------------
// Real content layer — replaces the article/author functions that used to
// live in src/lib/mock-data.ts (which still holds CATEGORIES — categories
// are a fixed, curated list, not database content).
// ---------------------------------------------------------------------------

function wordCount(body: string): number {
  const plain = body.replace(/<[^>]+>/g, " ");
  return plain.split(/\s+/).filter(Boolean).length;
}

function mapCoverImage(article: Article): MediaAsset {
  return {
    url: article.coverImageUrl || "/covers/placeholder.jpg",
    alt: article.coverImageAlt || article.title,
    width: 1600,
    height: 900,
  };
}

function mapCategory(slug: string): Category {
  return getCategoryBySlug(slug) ?? { slug: slug as Category["slug"], title: slug };
}

/** `articleCount` defaults to 0 — it's only shown on the author's own page, which computes it directly to avoid N+1 queries on article lists. */
export function mapAuthor(user: User, articleCount = 0): Author {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    title: user.title ?? ROLE_LABELS_FA[user.role],
    avatarUrl: user.avatarUrl || "/authors/default.jpg",
    bio: user.bio ?? "",
    social: {
      twitter: user.twitter ?? undefined,
      telegram: user.telegram ?? undefined,
      instagram: user.instagram ?? undefined,
    },
    articleCount,
  };
}

export function mapArticle(article: Article & { author: User }): NewsArticle {
  const words = wordCount(article.body);
  return {
    id: article.id,
    slug: article.slug,
    kind: article.kind,
    status: article.status,
    title: article.title,
    deck: article.deck ?? undefined,
    lead: article.lead,
    body: article.body,
    coverImage: mapCoverImage(article),
    videoUrl: article.videoUrl ?? undefined,
    audioUrl: article.audioUrl ?? undefined,
    category: mapCategory(article.categorySlug),
    tags: article.tags,
    author: mapAuthor(article.author),
    publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    readingMinutes: readingTime(words),
    wordCount: words,
    viewCount: article.viewCount,
    isFeatured: article.isFeatured,
    seo: {
      title: article.seoTitle ?? undefined,
      description: article.seoDescription ?? undefined,
      keywords: article.seoKeywords,
    },
  };
}

// A published article only counts once its scheduled publishedAt has passed —
// this is how "schedule for later" works without needing a background job.
const PUBLISHED_WHERE = { status: "PUBLISHED" as const, publishedAt: { lte: new Date() } };

export async function getFeaturedArticle(): Promise<NewsArticle | null> {
  const featured = await db.article.findFirst({
    where: { ...PUBLISHED_WHERE, isFeatured: true },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  });
  if (featured) return mapArticle(featured);

  const fallback = await db.article.findFirst({
    where: PUBLISHED_WHERE,
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  });
  return fallback ? mapArticle(fallback) : null;
}

export async function getLatestArticles(limit = 6): Promise<NewsArticle[]> {
  const articles = await db.article.findMany({
    where: PUBLISHED_WHERE,
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return articles.map(mapArticle);
}

export async function getMostVisited(limit = 5): Promise<NewsArticle[]> {
  const articles = await db.article.findMany({
    where: PUBLISHED_WHERE,
    include: { author: true },
    orderBy: { viewCount: "desc" },
    take: limit,
  });
  return articles.map(mapArticle);
}

export async function getArticlesByCategory(slug: string, limit?: number): Promise<NewsArticle[]> {
  const articles = await db.article.findMany({
    where: { ...PUBLISHED_WHERE, categorySlug: slug },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return articles.map(mapArticle);
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const article = await db.article.findUnique({ where: { slug }, include: { author: true } });
  if (!article || article.status !== "PUBLISHED" || (article.publishedAt ?? new Date(0)) > new Date()) {
    return null;
  }

  // Real page view — fire-and-forget so it doesn't block the page render.
  db.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return mapArticle(article);
}

export async function getRelatedArticles(article: NewsArticle, limit = 3): Promise<NewsArticle[]> {
  const articles = await db.article.findMany({
    where: { ...PUBLISHED_WHERE, categorySlug: article.category.slug, slug: { not: article.slug } },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return articles.map(mapArticle);
}

export async function getAuthorByUsername(username: string): Promise<Author | null> {
  const user = await db.user.findUnique({ where: { username } });
  if (!user) return null;
  const articleCount = await db.article.count({ where: { authorId: user.id, ...PUBLISHED_WHERE } });
  return mapAuthor(user, articleCount);
}

export async function getArticlesByAuthor(username: string): Promise<NewsArticle[]> {
  const user = await db.user.findUnique({ where: { username } });
  if (!user) return [];
  const articles = await db.article.findMany({
    where: { authorId: user.id, ...PUBLISHED_WHERE },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  });
  return articles.map(mapArticle);
}

// -- Reporter / editor workflow ---------------------------------------------

export async function getPendingArticlesForEditor(beats: string[]): Promise<NewsArticle[]> {
  const where =
    beats.length > 0
      ? { status: "PENDING_REVIEW" as const, categorySlug: { in: beats } }
      : { status: "PENDING_REVIEW" as const };
  const articles = await db.article.findMany({
    where,
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });
  return articles.map(mapArticle);
}

export interface CreateArticleInput {
  authorId: string;
  title: string;
  deck?: string;
  lead: string;
  body: string;
  categorySlug: string;
  tags: string[];
  coverImageUrl?: string;
  status: "DRAFT" | "PENDING_REVIEW";
}

export async function createArticle(input: CreateArticleInput) {
  return db.article.create({
    data: {
      slug: slugify(input.title),
      title: input.title,
      deck: input.deck || null,
      lead: input.lead,
      body: input.body,
      categorySlug: input.categorySlug,
      tags: input.tags,
      coverImageUrl: input.coverImageUrl || null,
      status: input.status,
      authorId: input.authorId,
    },
  });
}

export interface UpdateArticleInput {
  title?: string;
  deck?: string;
  lead?: string;
  body?: string;
  categorySlug?: string;
  tags?: string[];
  coverImageUrl?: string;
}

export async function updateArticleContent(articleId: string, input: UpdateArticleInput) {
  return db.article.update({
    where: { id: articleId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.deck !== undefined && { deck: input.deck || null }),
      ...(input.lead !== undefined && { lead: input.lead }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.categorySlug !== undefined && { categorySlug: input.categorySlug }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.coverImageUrl !== undefined && { coverImageUrl: input.coverImageUrl || null }),
    },
  });
}

export async function publishArticleNow(articleId: string) {
  return db.article.update({
    where: { id: articleId },
    data: { status: "PUBLISHED", publishedAt: new Date(), reviewNote: null },
  });
}

export async function scheduleArticle(articleId: string, publishedAt: Date) {
  return db.article.update({
    where: { id: articleId },
    data: { status: "PUBLISHED", publishedAt, reviewNote: null },
  });
}

export async function rejectArticle(articleId: string, note?: string) {
  return db.article.update({
    where: { id: articleId },
    data: { status: "REJECTED", reviewNote: note || null },
  });
}

export async function getArticlesByTag(tag: string, limit?: number): Promise<NewsArticle[]> {
  const articles = await db.article.findMany({
    where: { ...PUBLISHED_WHERE, tags: { has: tag } },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return articles.map(mapArticle);
}

export async function getReporterArticles(authorId: string) {
  return db.article.findMany({
    where: { authorId, status: { in: ["DRAFT", "PENDING_REVIEW", "REJECTED"] } },
    include: { author: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getArticleForOwner(articleId: string, authorId: string) {
  const article = await db.article.findUnique({ where: { id: articleId }, include: { author: true } });
  if (!article || article.authorId !== authorId) return null;
  return article;
}

// -- Featured article ("خبر ویژه") -------------------------------------------

export async function setFeaturedArticle(articleId: string) {
  await db.$transaction([
    db.article.updateMany({ where: { isFeatured: true }, data: { isFeatured: false } }),
    db.article.update({ where: { id: articleId }, data: { isFeatured: true } }),
  ]);
}

export async function clearFeaturedArticle() {
  await db.article.updateMany({ where: { isFeatured: true }, data: { isFeatured: false } });
}

// -- All published articles (admin/editor management) -----------------------

export async function getAllPublishedArticles() {
  return db.article.findMany({
    where: { status: "PUBLISHED" },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function deleteArticle(articleId: string) {
  return db.article.delete({ where: { id: articleId } });
}

// -- "پرونده‌های ویژه" (Special Cases) ----------------------------------------

export async function listSpecialCases() {
  return db.specialCase.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { articles: true } } },
  });
}

export interface CreateSpecialCaseInput {
  title: string;
  summary: string;
  coverImageUrl?: string;
}

export async function createSpecialCase(input: CreateSpecialCaseInput) {
  return db.specialCase.create({
    data: {
      slug: slugify(input.title),
      title: input.title,
      summary: input.summary,
      coverImageUrl: input.coverImageUrl || null,
    },
  });
}

export async function updateSpecialCase(id: string, input: CreateSpecialCaseInput) {
  return db.specialCase.update({
    where: { id },
    data: { title: input.title, summary: input.summary, coverImageUrl: input.coverImageUrl || null },
  });
}

export async function deleteSpecialCase(id: string) {
  await db.article.updateMany({ where: { specialCaseId: id }, data: { specialCaseId: null } });
  return db.specialCase.delete({ where: { id } });
}

export async function assignArticleToSpecialCase(articleId: string, specialCaseId: string | null) {
  return db.article.update({ where: { id: articleId }, data: { specialCaseId } });
}

export async function getSpecialCaseWithArticles(specialCaseId: string) {
  return db.specialCase.findUnique({
    where: { id: specialCaseId },
    include: { articles: { include: { author: true }, orderBy: { publishedAt: "desc" } } },
  });
}

/** Public special-case page — groups the case's published articles by kind. */
export async function getSpecialCaseBySlugPublic(slug: string): Promise<SpecialCase | null> {
  const record = await db.specialCase.findUnique({
    where: { slug },
    include: {
      articles: {
        where: PUBLISHED_WHERE,
        include: { author: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });
  if (!record) return null;

  const mapped = record.articles.map(mapArticle);
  const sections: SpecialCase["sections"] = (
    ["NEWS", "ANALYSIS", "REPORT", "DATA", "VIDEO", "INFOGRAPHIC"] as const
  )
    .map((kind) => ({
      kind,
      label: KIND_LABEL_FA[kind],
      articles: mapped.filter((a) => a.kind === kind),
    }))
    .filter((section) => section.articles.length > 0);

  return {
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    coverImage: {
      url: record.coverImageUrl || "/covers/placeholder.jpg",
      alt: record.title,
      width: 1600,
      height: 900,
    },
    startedAt: record.createdAt.toISOString(),
    sections,
  };
}

const KIND_LABEL_FA: Record<string, string> = {
  NEWS: "اخبار",
  ANALYSIS: "تحلیل",
  NOTE: "یادداشت",
  REPORT: "گزارش",
  DATA: "داده",
  VIDEO: "ویدیو",
  PODCAST: "پادکست",
  INFOGRAPHIC: "اینفوگرافیک",
};

// -- Reporter activity (admin panel) -----------------------------------------

export async function getReporterActivity(authorId: string) {
  const [draftCount, pendingCount, publishedCount, rejectedCount] = await Promise.all([
    db.article.count({ where: { authorId, status: "DRAFT" } }),
    db.article.count({ where: { authorId, status: "PENDING_REVIEW" } }),
    db.article.count({ where: { authorId, status: "PUBLISHED" } }),
    db.article.count({ where: { authorId, status: "REJECTED" } }),
  ]);
  return { draftCount, pendingCount, publishedCount, rejectedCount };
}

// -- Site-wide stats (admin panel) -------------------------------------------

export async function getSiteStats(): Promise<SiteStats> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);

  const [totalArticles, publishedThisWeek, pendingReview, viewsAgg] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { status: "PUBLISHED", publishedAt: { gte: weekAgo } } }),
    db.article.count({ where: { status: "PENDING_REVIEW" } }),
    db.article.aggregate({ _sum: { viewCount: true }, where: { status: "PUBLISHED" } }),
  ]);

  return {
    totalArticles,
    publishedThisWeek,
    pendingReview,
    totalViews: viewsAgg._sum.viewCount ?? 0,
  };
}

/** Full stats breakdown for the admin's dedicated stats page. */
export async function getDetailedSiteStats() {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);

  const [
    totalPublished,
    publishedThisWeek,
    totalDrafts,
    pendingReview,
    totalRejected,
    viewsAgg,
    totalReporters,
    activeReporters,
    pendingReporterApprovals,
    totalEditors,
    totalVoiceSubmissions,
    pendingVoiceSubmissions,
    totalContactMessages,
    unreadContactMessages,
    categoryBreakdown,
  ] = await Promise.all([
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.article.count({ where: { status: "PUBLISHED", publishedAt: { gte: weekAgo } } }),
    db.article.count({ where: { status: "DRAFT" } }),
    db.article.count({ where: { status: "PENDING_REVIEW" } }),
    db.article.count({ where: { status: "REJECTED" } }),
    db.article.aggregate({ _sum: { viewCount: true }, where: { status: "PUBLISHED" } }),
    db.user.count({ where: { role: "REPORTER" } }),
    db.user.count({ where: { role: "REPORTER", isActive: true, approvalStatus: "APPROVED" } }),
    db.user.count({ where: { role: "REPORTER", approvalStatus: "PENDING" } }),
    db.user.count({ where: { role: "EDITOR" } }),
    db.voiceSubmission.count(),
    db.voiceSubmission.count({ where: { status: "SUBMITTED" } }),
    db.contactMessage.count(),
    db.contactMessage.count({ where: { status: "UNREAD" } }),
    db.article.groupBy({ by: ["categorySlug"], where: { status: "PUBLISHED" }, _count: true }),
  ]);

  return {
    totalPublished,
    publishedThisWeek,
    totalDrafts,
    pendingReview,
    totalRejected,
    totalViews: viewsAgg._sum.viewCount ?? 0,
    totalReporters,
    activeReporters,
    pendingReporterApprovals,
    totalEditors,
    totalVoiceSubmissions,
    pendingVoiceSubmissions,
    totalContactMessages,
    unreadContactMessages,
    categoryBreakdown: categoryBreakdown
      .map((c) => ({ slug: c.categorySlug, count: c._count }))
      .sort((a, b) => b.count - a.count),
  };
}
