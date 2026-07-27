// ---------------------------------------------------------------------------
// مدار مردم — shared domain types
// These mirror the Prisma schema (see prisma/schema.prisma) but are kept as
// plain TypeScript so UI code can use them without importing @prisma/client
// on the client bundle.
// ---------------------------------------------------------------------------

export type UserRole = "REPORTER" | "EDITOR" | "ADMIN";

export type ArticleStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";

export type ArticleKind =
  | "NEWS"
  | "ANALYSIS"
  | "NOTE"
  | "REPORT"
  | "DATA"
  | "VIDEO"
  | "PODCAST"
  | "INFOGRAPHIC";

export type CategorySlug =
  | "society"
  | "economy"
  | "politics"
  | "provinces"
  | "world"
  | "analysis"
  | "notes"
  | "reports"
  | "special-cases"
  | "data"
  | "video"
  | "podcast"
  | "infographic"
  | "voice";

export interface Category {
  slug: CategorySlug;
  title: string; // Persian display name
  description?: string;
}

export interface Author {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  title: string; // e.g. "خبرنگار حوزه اقتصاد"
  avatarUrl: string;
  bio: string;
  social?: {
    twitter?: string;
    telegram?: string;
    instagram?: string;
    email?: string;
  };
  articleCount: number;
}

export interface MediaAsset {
  url: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export interface NewsArticle {
  id: string;
  slug: string;
  kind: ArticleKind;
  status: ArticleStatus;

  title: string; // تیتر
  deck?: string; // روتیتر (subtitle above headline)
  lead: string; // لید (opening paragraph / dek)
  body: string; // HTML or Markdown body

  coverImage: MediaAsset;
  gallery?: MediaAsset[];
  videoUrl?: string;
  audioUrl?: string;

  category: Category;
  tags: string[];

  author: Author;
  coAuthors?: Author[];

  publishedAt: string; // ISO date
  updatedAt?: string; // ISO date
  readingMinutes: number;
  wordCount: number;

  viewCount: number;
  isFeatured?: boolean;

  relatedSlugs?: string[];

  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface SpecialCaseSection {
  kind: ArticleKind;
  label: string;
  articles: NewsArticle[];
}

export interface SpecialCase {
  slug: string;
  title: string;
  summary: string;
  coverImage: MediaAsset;
  startedAt: string;
  sections: SpecialCaseSection[];
}

// -- "نبض جامعه" (Pulse of Society) mini dashboard -------------------------

export type PulseTrend = "up" | "down" | "flat";

export type PulseMetric =
  | "usd"
  | "gold"
  | "coin"
  | "stock"
  | "inflation"
  | "subsidy"
  | "gasoline"
  | "housing"
  | "weather"
  | "pollution";

export interface PulseItem {
  metric: PulseMetric;
  label: string; // Persian label, e.g. "دلار"
  value: string; // pre-formatted display value, e.g. "۶۹,۸۰۰"
  unit?: string; // e.g. "تومان", "درجه"
  trend: PulseTrend;
  changePercent?: number; // e.g. 1.2 or -0.8
  updatedAt: string; // ISO date, for "به‌روزرسانی X دقیقه پیش"
  sparkline?: number[]; // small series of recent values for a mini chart
}

// -- "صدای مردم" (Voice of People) submissions ------------------------------

export type VoiceSubmissionKind = "NEWS_TIP" | "PHOTO" | "VIDEO" | "REPORT";
export type VoiceSubmissionStatus = "SUBMITTED" | "IN_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";

export interface VoiceSubmission {
  trackingCode: string;
  kind: VoiceSubmissionKind;
  title: string;
  description: string;
  category: CategorySlug;
  location?: string;
  fileUrls?: string[];
  status: VoiceSubmissionStatus;
  submittedAt: string;
  statusNote?: string;
}

// -- Dashboard / admin -------------------------------------------------------
// Note: real user accounts use Prisma's generated `User` type (from
// @prisma/client) directly — see src/app/dashboard/admin/page.tsx. This
// SiteStats type covers the article-related stats, which are still mock data.

export interface SiteStats {
  totalArticles: number;
  publishedThisWeek: number;
  pendingReview: number;
  totalViews: number;
}
