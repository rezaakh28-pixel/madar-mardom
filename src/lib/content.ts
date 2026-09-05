import { db } from "@/lib/db";
import { getCategoryBySlug } from "@/lib/mock-data";
import { readingTime } from "@/lib/utils";
import { ROLE_LABELS_FA } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { reporterCodename } from "@/lib/codename";
import { Prisma } from "@prisma/client";
import type { Article, User } from "@prisma/client";
import type { Author, Category, MediaAsset, NewsArticle, SiteStats, SpecialCase, ArticleKind, ArticleStatus } from "@/types";

/**
 * "public" (default): the byline/author name shown is the reporter's
 * codename — used by every visitor-facing page.
 * "internal": the real name is shown — used only inside /dashboard, where
 * editors/admins need to know who actually wrote something.
 */
export type ContentViewer = "public" | "internal";

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
  const isPortrait = article.coverImageOrientation === "portrait";
  return {
    url: article.coverImageUrl || "/covers/placeholder.jpg",
    alt: article.coverImageAlt || article.title,
    width: isPortrait ? 1200 : 1600,
    height: isPortrait ? 1500 : 900,
    objectPosition: article.coverImagePosition || "center",
  };
}

/** Parses the free-form `galleryJson` column (an array of `{url, alt?}`) into `MediaAsset[]` — used by photo-report ("گزارش تصویری") articles. */
function mapGallery(article: Article): MediaAsset[] {
  const raw = article.galleryJson;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is { url: string; alt?: string } => {
      return Boolean(item) && typeof item === "object" && typeof (item as Record<string, unknown>).url === "string";
    })
    .map((item, i) => ({
      url: item.url,
      alt: item.alt || `${article.title} — تصویر ${i + 1}`,
      width: 1200,
      height: 900,
    }));
}

function mapCategory(slug: string): Category {
  return getCategoryBySlug(slug) ?? { slug: slug as Category["slug"], title: slug };
}

/** `articleCount` defaults to 0 — it's only shown on the author's own page, which computes it directly to avoid N+1 queries on article lists. */
export function mapAuthor(user: User, articleCount = 0, viewer: ContentViewer = "public"): Author {
  // Real names (reporters, editors, and admins alike) are never shown
  // publicly — only their deterministic codename is, everywhere outside the
  // internal dashboards. See src/lib/codename.ts. The same goes for their
  // real role/title: an editor or admin authoring something public must not
  // be distinguishable from a reporter, so the public title is always the
  // generic "خبرنگار", regardless of the person's actual role.
  const displayName = viewer === "public" ? reporterCodename(user.name, user.createdAt) : user.name;
  const displayTitle = viewer === "public" ? ROLE_LABELS_FA.REPORTER : (user.title ?? ROLE_LABELS_FA[user.role]);

  return {
    id: user.id,
    username: user.username,
    name: displayName,
    role: user.role,
    title: displayTitle,
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

export function mapArticle(article: Article & { author: User }, viewer: ContentViewer = "public"): NewsArticle {
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
    coverOrientation: article.coverImageOrientation === "portrait" ? "portrait" : "landscape",
    gallery: mapGallery(article),
    videoUrl: article.videoUrl ?? undefined,
    audioUrl: article.audioUrl ?? undefined,
    category: mapCategory(article.categorySlug),
    tags: article.tags,
    author: mapAuthor(article.author, 0, viewer),
    publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    readingMinutes: readingTime(words),
    wordCount: words,
    viewCount: article.viewCount,
    featuredRank: article.featuredRank,
    isCitizenReport: article.isCitizenReport,
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

/**
 * Up to 3 articles for the homepage hero carousel, ordered by their
 * assigned slot (1, 2, 3). If an admin/editor hasn't filled all 3 slots,
 * the remaining spots are padded with the latest published articles so the
 * homepage always shows a full carousel where possible.
 */
export async function getFeaturedArticles(): Promise<NewsArticle[]> {
  const featured = await db.article.findMany({
    where: { ...PUBLISHED_WHERE, featuredRank: { in: [1, 2, 3] } },
    include: { author: true },
    orderBy: { featuredRank: "asc" },
  });

  if (featured.length >= 3) {
    return featured.slice(0, 3).map((a) => mapArticle(a));
  }

  const filler = await db.article.findMany({
    where: { ...PUBLISHED_WHERE, id: { notIn: featured.map((a) => a.id) } },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: 3 - featured.length,
  });

  return [...featured, ...filler].map((a) => mapArticle(a));
}

export async function getLatestArticles(limit = 6): Promise<NewsArticle[]> {
  const articles = await db.article.findMany({
    where: PUBLISHED_WHERE,
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return articles.map((a) => mapArticle(a));
}

export async function getMostVisited(limit = 5): Promise<NewsArticle[]> {
  const articles = await db.article.findMany({
    where: PUBLISHED_WHERE,
    include: { author: true },
    orderBy: { viewCount: "desc" },
    take: limit,
  });
  return articles.map((a) => mapArticle(a));
}

export async function getArticlesByCategory(slug: string, limit?: number): Promise<NewsArticle[]> {
  const articles = await db.article.findMany({
    where: { ...PUBLISHED_WHERE, categorySlug: slug },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return articles.map((a) => mapArticle(a));
}

export interface PaginatedArticles {
  articles: NewsArticle[];
  totalCount: number;
}

/** Powers the category ("موضوعات") pages' pagination — 8 per page, page buttons at the bottom. */
export async function getArticlesByCategoryPaginated(
  slug: string,
  page: number,
  pageSize: number
): Promise<PaginatedArticles> {
  const where = { ...PUBLISHED_WHERE, categorySlug: slug };
  const [articles, totalCount] = await Promise.all([
    db.article.findMany({
      where,
      include: { author: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.article.count({ where }),
  ]);
  return { articles: articles.map((a) => mapArticle(a)), totalCount };
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
  return articles.map((a) => mapArticle(a));
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
  return articles.map((a) => mapArticle(a));
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
  // Internal viewer: this feeds the editor's review queue, which must show
  // the reporter's real name, not their public codename.
  return articles.map((a) => mapArticle(a, "internal"));
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
  coverImageOrientation?: "landscape" | "portrait";
  coverImagePosition?: string;
  /** Photo-report ("گزارش تصویری") image URLs, shown as a grid gallery instead of body text. */
  galleryImages?: string[];
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
      coverImageOrientation: input.coverImageOrientation || "landscape",
      coverImagePosition: input.coverImagePosition || "center",
      galleryJson:
        input.galleryImages && input.galleryImages.length > 0
          ? input.galleryImages.map((url) => ({ url }))
          : undefined,
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
  coverImageOrientation?: "landscape" | "portrait";
  coverImagePosition?: string;
  /** Photo-report ("گزارش تصویری") image URLs, shown as a grid gallery instead of body text. */
  galleryImages?: string[];
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
      ...(input.coverImageOrientation !== undefined && { coverImageOrientation: input.coverImageOrientation }),
      ...(input.coverImagePosition !== undefined && { coverImagePosition: input.coverImagePosition }),
      ...(input.galleryImages !== undefined && {
        galleryJson:
          input.galleryImages.length > 0 ? input.galleryImages.map((url) => ({ url })) : Prisma.JsonNull,
      }),
    },
  });
}

export async function publishArticleNow(articleId: string, editorId: string) {
  return db.article.update({
    where: { id: articleId },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      reviewNote: null,
      reviewedByEditorId: editorId,
      reviewedAt: new Date(),
    },
  });
}

export async function scheduleArticle(articleId: string, publishedAt: Date, editorId: string) {
  return db.article.update({
    where: { id: articleId },
    data: {
      status: "PUBLISHED",
      publishedAt,
      reviewNote: null,
      reviewedByEditorId: editorId,
      reviewedAt: new Date(),
    },
  });
}

export async function rejectArticle(articleId: string, note: string | undefined, editorId: string) {
  return db.article.update({
    where: { id: articleId },
    data: {
      status: "REJECTED",
      reviewNote: note || null,
      reviewedByEditorId: editorId,
      reviewedAt: new Date(),
    },
  });
}

export interface CreateCitizenReportInput {
  authorId: string;
  title: string;
  deck?: string;
  lead: string;
  body: string;
  categorySlug: string;
  tags?: string[];
  coverImageUrl?: string;
  coverImageOrientation?: "landscape" | "portrait";
  coverImagePosition?: string;
}

export async function createCitizenReportArticle(input: CreateCitizenReportInput) {
  return db.article.create({
    data: {
      slug: slugify(input.title),
      title: input.title,
      deck: input.deck || null,
      lead: input.lead,
      body: input.body,
      categorySlug: input.categorySlug,
      tags: input.tags ?? [],
      coverImageUrl: input.coverImageUrl || null,
      coverImageOrientation: input.coverImageOrientation || "landscape",
      coverImagePosition: input.coverImagePosition || "center",
      status: "PUBLISHED",
      publishedAt: new Date(),
      isCitizenReport: true,
      kind: "REPORT",
      authorId: input.authorId,
    },
  });
}

export async function getCitizenReports(limit?: number): Promise<NewsArticle[]> {
  const articles = await db.article.findMany({
    where: { ...PUBLISHED_WHERE, isCitizenReport: true },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return articles.map((a) => mapArticle(a));
}

export async function searchArticles(query: string, limit = 24): Promise<NewsArticle[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const articles = await db.article.findMany({
    where: {
      ...PUBLISHED_WHERE,
      OR: [
        { title: { contains: trimmed, mode: "insensitive" } },
        { body: { contains: trimmed, mode: "insensitive" } },
        { lead: { contains: trimmed, mode: "insensitive" } },
        { tags: { has: trimmed } },
      ],
    },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return articles.map((a) => mapArticle(a));
}

export async function getArticlesByTag(tag: string, limit?: number): Promise<NewsArticle[]> {
  const articles = await db.article.findMany({
    where: { ...PUBLISHED_WHERE, tags: { has: tag } },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return articles.map((a) => mapArticle(a));
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

// -- Featured articles ("خبر ویژه" — 3-slot homepage hero carousel) ---------

/**
 * Assigns `articleId` to hero slot `rank` (1, 2, or 3). If another article
 * currently holds that slot, it's bumped back to unranked — each slot can
 * only ever hold one article at a time.
 */
export async function setFeaturedArticleRank(articleId: string, rank: 1 | 2 | 3) {
  await db.$transaction([
    db.article.updateMany({ where: { featuredRank: rank }, data: { featuredRank: null } }),
    db.article.update({ where: { id: articleId }, data: { featuredRank: rank } }),
  ]);
}

export async function clearFeaturedRank(rank: 1 | 2 | 3) {
  await db.article.updateMany({ where: { featuredRank: rank }, data: { featuredRank: null } });
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

  const mapped = record.articles.map((a) => mapArticle(a));
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

const KIND_LABEL_FA: Record<ArticleKind, string> = {
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

// -- Full user activity (admin panel — click a reporter/editor's name) ------

export type ActivityPeriod = "week" | "month" | "year" | "all";

export interface UserActivityFilter {
  period?: ActivityPeriod;
  /** Category slug, or omitted/undefined for all categories. */
  categorySlug?: string;
}

export interface UserActivityArticle {
  id: string;
  slug: string;
  title: string;
  status: ArticleStatus;
  kind: ArticleKind;
  categorySlug: string;
  viewCount: number;
  createdAt: string;
  publishedAt: string | null;
}

export interface UserActivityReviewedArticle {
  id: string;
  slug: string;
  title: string;
  status: ArticleStatus;
  categorySlug: string;
  authorName: string;
  reviewedAt: string | null;
}

export interface UserActivitySummary {
  authored: {
    total: number;
    byStatus: Record<ArticleStatus, number>;
    totalViews: number;
    byCategory: Array<{ slug: string; count: number }>;
    articles: UserActivityArticle[];
  };
  /** Editorial review actions (publish/reject) this person has taken on OTHER people's articles. Empty for reporters. */
  reviewed: {
    total: number;
    published: number;
    rejected: number;
    articles: UserActivityReviewedArticle[];
  };
}

function activityPeriodStart(period: ActivityPeriod): Date | undefined {
  const now = Date.now();
  switch (period) {
    case "week":
      return new Date(now - 7 * 86_400_000);
    case "month":
      return new Date(now - 30 * 86_400_000);
    case "year":
      return new Date(now - 365 * 86_400_000);
    default:
      return undefined;
  }
}

const EMPTY_STATUS_COUNTS: Record<ArticleStatus, number> = {
  DRAFT: 0,
  PENDING_REVIEW: 0,
  PUBLISHED: 0,
  REJECTED: 0,
  ARCHIVED: 0,
};

/**
 * Complete activity record for one reporter or editor — everything they've
 * authored (any status), plus, for editors, everything they've reviewed
 * (published or rejected). Powers the detail view opened by clicking a
 * name in /dashboard/admin/reporters or /dashboard/admin/editors.
 */
export async function getUserActivity(userId: string, filter: UserActivityFilter = {}): Promise<UserActivitySummary> {
  const since = activityPeriodStart(filter.period ?? "all");
  const categorySlug = filter.categorySlug;

  const authoredWhere = {
    authorId: userId,
    ...(since ? { createdAt: { gte: since } } : {}),
    ...(categorySlug ? { categorySlug } : {}),
  };

  const [authoredArticles, byStatusGroups, byCategoryGroups, viewsAgg] = await Promise.all([
    db.article.findMany({ where: authoredWhere, orderBy: { createdAt: "desc" }, take: 300 }),
    db.article.groupBy({ by: ["status"], where: authoredWhere, _count: true }),
    db.article.groupBy({ by: ["categorySlug"], where: authoredWhere, _count: true }),
    db.article.aggregate({ where: authoredWhere, _sum: { viewCount: true } }),
  ]);

  const byStatus = { ...EMPTY_STATUS_COUNTS };
  for (const g of byStatusGroups) byStatus[g.status] = g._count;

  const reviewedWhere = {
    reviewedByEditorId: userId,
    ...(since ? { reviewedAt: { gte: since } } : {}),
    ...(categorySlug ? { categorySlug } : {}),
  };

  const reviewedArticles = await db.article.findMany({
    where: reviewedWhere,
    include: { author: true },
    orderBy: { reviewedAt: "desc" },
    take: 300,
  });

  return {
    authored: {
      total: authoredArticles.length,
      byStatus,
      totalViews: viewsAgg._sum.viewCount ?? 0,
      byCategory: byCategoryGroups
        .map((c) => ({ slug: c.categorySlug, count: c._count }))
        .sort((a, b) => b.count - a.count),
      articles: authoredArticles.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        status: a.status,
        kind: a.kind,
        categorySlug: a.categorySlug,
        viewCount: a.viewCount,
        createdAt: a.createdAt.toISOString(),
        publishedAt: a.publishedAt?.toISOString() ?? null,
      })),
    },
    reviewed: {
      total: reviewedArticles.length,
      published: reviewedArticles.filter((a) => a.status === "PUBLISHED").length,
      rejected: reviewedArticles.filter((a) => a.status === "REJECTED").length,
      articles: reviewedArticles.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        status: a.status,
        categorySlug: a.categorySlug,
        authorName: a.author.name,
        reviewedAt: a.reviewedAt?.toISOString() ?? null,
      })),
    },
  };
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
