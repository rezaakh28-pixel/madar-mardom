import type { Category, SpecialCase } from "@/types";

// ---------------------------------------------------------------------------
// The only genuinely static content left: the fixed list of site sections.
// Everything else (articles, authors, pulse data, users) is real,
// database-backed content now — see src/lib/content.ts, src/lib/pulse.ts,
// and src/lib/session.ts.
// ---------------------------------------------------------------------------

export const CATEGORIES: Category[] = [
  { slug: "society", title: "جامعه", description: "زندگی روزمره، شهروندان و مسائل اجتماعی" },
  { slug: "economy", title: "اقتصاد", description: "بازار، معیشت و تحلیل‌های اقتصادی" },
  { slug: "politics", title: "سیاست", description: "تحولات سیاسی داخلی و بین‌الملل" },
  { slug: "provinces", title: "استان‌ها", description: "اخبار شهرستان‌ها و مناطق کشور" },
  { slug: "world", title: "جهان", description: "اخبار بین‌المللی" },
  { slug: "analysis", title: "تحلیل", description: "واکاوی عمیق رویدادها" },
  { slug: "notes", title: "یادداشت", description: "دیدگاه و نظر نویسندگان" },
  { slug: "reports", title: "گزارش", description: "گزارش‌های میدانی و تحقیقی" },
  { slug: "special-cases", title: "پرونده‌های ویژه", description: "روایت چندرسانه‌ای یک موضوع" },
  { slug: "data", title: "داده", description: "روایت اعداد و آمار رسمی" },
  { slug: "video", title: "ویدیو", description: "گزارش‌های تصویری" },
  { slug: "podcast", title: "پادکست", description: "شنیدنی‌های مدار مردم" },
  { slug: "infographic", title: "گزارش تصویری", description: "داده‌ها به زبان تصویر" },
  { slug: "voice", title: "صدای مردم", description: "روایت‌های مردمی" },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

// "پرونده‌های ویژه" (Special Cases) isn't part of the real content migration
// yet — starts empty rather than showing placeholder articles. The pages
// that read this already handle an empty list gracefully.
export const SPECIAL_CASES: SpecialCase[] = [];

export function getSpecialCaseBySlug(slug: string): SpecialCase | undefined {
  return SPECIAL_CASES.find((s) => s.slug === slug);
}
