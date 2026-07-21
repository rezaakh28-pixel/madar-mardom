import type {
  Author,
  Category,
  CategorySlug,
  DashboardUser,
  NewsArticle,
  PulseItem,
  SiteStats,
  SpecialCase,
} from "@/types";

// ---------------------------------------------------------------------------
// Mock data. Every function here has the exact shape a Prisma-backed query
// would return, so swapping `getX()` for `db.x.findMany()` later is a
// one-file change (see comments inline).
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
  { slug: "infographic", title: "اینفوگرافیک", description: "داده‌ها به زبان تصویر" },
  { slug: "voice", title: "صدای مردم", description: "روایت‌های مردمی" },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export const AUTHORS: Author[] = [
  {
    id: "au_1",
    username: "sara-ahmadi",
    name: "سارا احمدی",
    role: "REPORTER",
    title: "خبرنگار حوزه اقتصاد",
    avatarUrl: "/authors/sara-ahmadi.jpg",
    bio: "سارا احمدی نزدیک به هشت سال است در حوزه اقتصاد کلان و معیشت خانوار می‌نویسد. تمرکز او روی روایت اعداد و آمار به زبان ساده برای مخاطب عمومی است.",
    social: { twitter: "https://twitter.com/example", telegram: "https://t.me/example" },
    articleCount: 214,
  },
  {
    id: "au_2",
    username: "reza-karimi",
    name: "رضا کریمی",
    role: "EDITOR",
    title: "سردبیر بخش جامعه",
    avatarUrl: "/authors/reza-karimi.jpg",
    bio: "رضا کریمی سردبیر بخش جامعه مدار مردم و پیش از آن گزارشگر میدانی حوزه شهری بوده است.",
    social: { instagram: "https://instagram.com/example" },
    articleCount: 156,
  },
  {
    id: "au_3",
    username: "mina-jafari",
    name: "مینا جعفری",
    role: "REPORTER",
    title: "تحلیلگر داده و اینفوگرافیک",
    avatarUrl: "/authors/mina-jafari.jpg",
    bio: "مینا جعفری داده‌های رسمی کشور را به روایت‌های تصویری قابل فهم برای عموم تبدیل می‌کند.",
    social: { email: "mina@example.com" },
    articleCount: 89,
  },
];

export function getAuthorByUsername(username: string): Author | undefined {
  return AUTHORS.find((a) => a.username === username);
}

function cat(slug: CategorySlug): Category {
  const c = getCategoryBySlug(slug);
  if (!c) throw new Error(`Unknown category slug: ${slug}`);
  return c;
}

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000).toISOString();

export const ARTICLES: NewsArticle[] = [
  {
    id: "art_1",
    slug: "housing-price-report-1405",
    kind: "NEWS",
    status: "PUBLISHED",
    title: "رشد ۱۸ درصدی اجاره‌بها در تهران طی سه‌ماهه اخیر",
    deck: "بررسی مدار مردم از تازه‌ترین آمار بازار مسکن",
    lead: "گزارش‌های میدانی مدار مردم از مناطق مختلف تهران نشان می‌دهد اجاره‌بها در سه‌ماهه اخیر رشدی به‌مراتب بیشتر از نرخ تورم رسمی داشته و فشار تازه‌ای بر خانوارهای مستأجر وارد کرده است.",
    body: "<p>بر اساس داده‌های جمع‌آوری‌شده از بنگاه‌های معاملات ملکی در مناطق مختلف تهران، میانگین اجاره‌بها در سه‌ماهه اخیر نسبت به مدت مشابه سال قبل رشدی معادل ۱۸ درصد داشته است...</p><p>کارشناسان این حوزه دلایل متعددی از جمله رشد نقدینگی، کاهش ساخت‌وساز و افزایش تقاضای اجاره را در این روند مؤثر می‌دانند...</p>",
    coverImage: {
      url: "/covers/housing.jpg",
      alt: "مجتمع‌های مسکونی در تهران",
      width: 1600,
      height: 900,
    },
    category: cat("economy"),
    tags: ["مسکن", "اجاره‌بها", "تهران", "اقتصاد خانوار"],
    author: AUTHORS[0]!,
    publishedAt: hoursAgo(2),
    readingMinutes: 6,
    wordCount: 1080,
    viewCount: 18420,
    isFeatured: true,
    relatedSlugs: ["subsidy-reform-explainer", "inflation-food-basket"],
  },
  {
    id: "art_2",
    slug: "subsidy-reform-explainer",
    kind: "ANALYSIS",
    status: "PUBLISHED",
    title: "طرح اصلاح یارانه‌ها چه تغییری در سفره خانوار ایجاد می‌کند؟",
    deck: "توضیح ساده یک طرح پیچیده",
    lead: "طرح جدید اصلاح یارانه‌ها که این هفته در دولت مطرح شد، می‌تواند نحوه پرداخت یارانه نقدی به دهک‌های مختلف را تغییر دهد. مدار مردم این طرح را به زبان ساده بررسی کرده است.",
    body: "<p>در متن پیشنهادی، دهک‌های بالای درآمدی از فهرست دریافت‌کنندگان یارانه نقدی حذف می‌شوند و منابع آزادشده به دهک‌های پایین اختصاص می‌یابد...</p>",
    coverImage: { url: "/covers/subsidy.jpg", alt: "بازار محلی", width: 1600, height: 900 },
    category: cat("economy"),
    tags: ["یارانه", "معیشت", "دولت"],
    author: AUTHORS[0]!,
    publishedAt: hoursAgo(6),
    readingMinutes: 8,
    wordCount: 1450,
    viewCount: 9310,
    relatedSlugs: ["housing-price-report-1405"],
  },
  {
    id: "art_3",
    slug: "tehran-air-pollution-schools",
    kind: "NEWS",
    status: "PUBLISHED",
    title: "تعطیلی مدارس ۴ منطقه تهران به دلیل آلودگی هوا",
    lead: "شاخص کیفیت هوا در چهار منطقه تهران امروز به مرز ناسالم برای گروه‌های حساس رسید و ستاد مدیریت بحران تعطیلی مدارس ابتدایی این مناطق را اعلام کرد.",
    body: "<p>بر اساس اعلام شرکت کنترل کیفیت هوای تهران، غلظت ذرات معلق در ساعات ابتدایی صبح امروز افزایش یافت...</p>",
    coverImage: { url: "/covers/pollution.jpg", alt: "آسمان آلوده تهران", width: 1600, height: 900 },
    category: cat("society"),
    tags: ["آلودگی هوا", "تهران", "مدارس"],
    author: AUTHORS[1]!,
    publishedAt: hoursAgo(3),
    readingMinutes: 3,
    wordCount: 420,
    viewCount: 22110,
  },
  {
    id: "art_4",
    slug: "khuzestan-water-report",
    kind: "REPORT",
    status: "PUBLISHED",
    title: "روایت کم‌آبی از دل روستاهای خوزستان؛ گزارشی میدانی",
    lead: "گزارشگر مدار مردم به چند روستای کم‌برخوردار در حاشیه کارون سفر کرده و وضعیت تأمین آب شرب را از نزدیک بررسی کرده است.",
    body: "<p>در مسیر جاده‌های خاکی حاشیه کارون، بسیاری از اهالی هنوز برای تأمین آب شرب به تانکرهای سیار متکی هستند...</p>",
    coverImage: { url: "/covers/khuzestan.jpg", alt: "رودخانه کارون", width: 1600, height: 900 },
    category: cat("provinces"),
    tags: ["خوزستان", "آب", "گزارش میدانی"],
    author: AUTHORS[1]!,
    publishedAt: hoursAgo(20),
    readingMinutes: 10,
    wordCount: 1800,
    viewCount: 7040,
  },
  {
    id: "art_5",
    slug: "employment-data-1405-q1",
    kind: "DATA",
    status: "PUBLISHED",
    title: "نرخ بیکاری جوانان در بهار ۱۴۰۵ چقدر بود؟",
    lead: "مرکز آمار داده‌های بازار کار در سه‌ماهه بهار را منتشر کرد. مدار مردم مهم‌ترین اعداد را در چند نمودار ساده روایت کرده است.",
    body: "<p>بر اساس گزارش تازه، نرخ بیکاری در گروه سنی ۱۸ تا ۲۴ سال نسبت به فصل گذشته تغییری اندک داشته است...</p>",
    coverImage: { url: "/covers/employment-data.jpg", alt: "نمودار اشتغال", width: 1600, height: 900 },
    category: cat("data"),
    tags: ["اشتغال", "جوانان", "آمار"],
    author: AUTHORS[2]!,
    publishedAt: hoursAgo(30),
    readingMinutes: 4,
    wordCount: 600,
    viewCount: 5210,
  },
  {
    id: "art_6",
    slug: "small-business-documentary",
    kind: "VIDEO",
    status: "PUBLISHED",
    title: "مستند کوتاه: کارگاه‌های خانگی که سرپا مانده‌اند",
    lead: "روایت تصویری چند کسب‌وکار خانگی که در سال‌های سخت اقتصادی همچنان به فعالیت خود ادامه داده‌اند.",
    body: "<p>در این مستند کوتاه با سه کارگاه خانگی در حاشیه شهر همراه می‌شویم...</p>",
    coverImage: { url: "/covers/small-business.jpg", alt: "کارگاه خیاطی خانگی", width: 1600, height: 900 },
    videoUrl: "https://example.com/videos/small-business.mp4",
    category: cat("video"),
    tags: ["کسب‌وکار خانگی", "مستند"],
    author: AUTHORS[1]!,
    publishedAt: hoursAgo(48),
    readingMinutes: 12,
    wordCount: 200,
    viewCount: 15870,
  },
];

export function getFeaturedArticle(): NewsArticle {
  return ARTICLES.find((a) => a.isFeatured) ?? ARTICLES[0]!;
}

export function getLatestArticles(limit = 6): NewsArticle[] {
  return [...ARTICLES]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, limit);
}

export function getMostVisited(limit = 5): NewsArticle[] {
  return [...ARTICLES].sort((a, b) => b.viewCount - a.viewCount).slice(0, limit);
}

export function getArticlesByCategory(slug: CategorySlug, limit?: number): NewsArticle[] {
  const list = ARTICLES.filter((a) => a.category.slug === slug);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function getArticlesByAuthor(username: string): NewsArticle[] {
  return ARTICLES.filter((a) => a.author.username === username);
}

/**
 * Mock DB lookup for a single article. In production this becomes:
 *   return db.article.findUnique({ where: { slug }, include: { author: true, category: true } })
 */
export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  // simulate network/DB latency
  await new Promise((r) => setTimeout(r, 0));
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function getRelatedArticles(article: NewsArticle, limit = 3): NewsArticle[] {
  const bySlug = (article.relatedSlugs ?? [])
    .map((s) => ARTICLES.find((a) => a.slug === s))
    .filter((a): a is NewsArticle => Boolean(a));
  if (bySlug.length >= limit) return bySlug.slice(0, limit);

  const sameCategory = ARTICLES.filter(
    (a) => a.category.slug === article.category.slug && a.slug !== article.slug
  );
  return [...bySlug, ...sameCategory].slice(0, limit);
}

// -- Pulse of Society ---------------------------------------------------

export const PULSE_ITEMS: PulseItem[] = [
  { metric: "usd", label: "دلار", value: "۶۹,۸۰۰", unit: "تومان", trend: "up", changePercent: 0.6, updatedAt: hoursAgo(0), sparkline: [67200, 67900, 68400, 68100, 69200, 69800] },
  { metric: "gold", label: "طلای ۱۸ عیار", value: "۴,۸۲۰,۰۰۰", unit: "تومان", trend: "up", changePercent: 1.1, updatedAt: hoursAgo(0), sparkline: [4600000, 4650000, 4700000, 4750000, 4790000, 4820000] },
  { metric: "coin", label: "سکه امامی", value: "۵۲,۱۰۰,۰۰۰", unit: "تومان", trend: "down", changePercent: -0.4, updatedAt: hoursAgo(0), sparkline: [52600000, 52400000, 52300000, 52500000, 52200000, 52100000] },
  { metric: "stock", label: "شاخص بورس", value: "۲,۱۴۵,۰۰۰", trend: "up", changePercent: 0.8, updatedAt: hoursAgo(1), sparkline: [2100000, 2110000, 2125000, 2118000, 2138000, 2145000] },
  { metric: "inflation", label: "تورم نقطه‌به‌نقطه", value: "۳۱.۲", unit: "درصد", trend: "flat", changePercent: 0.1, updatedAt: hoursAgo(24) },
  { metric: "subsidy", label: "یارانه نقدی", value: "۴۰۰,۰۰۰", unit: "تومان", trend: "flat", updatedAt: hoursAgo(72) },
  { metric: "gasoline", label: "بنزین سهمیه‌ای", value: "۱۵,۰۰۰", unit: "ریال", trend: "flat", updatedAt: hoursAgo(72) },
  { metric: "housing", label: "متوسط اجاره تهران", value: "۲۸", unit: "میلیون تومان", trend: "up", changePercent: 2.3, updatedAt: hoursAgo(24) },
  { metric: "weather", label: "دمای تهران", value: "۳۴", unit: "درجه", trend: "up", updatedAt: hoursAgo(0) },
  { metric: "pollution", label: "کیفیت هوا", value: "۱۵۸", unit: "ناسالم", trend: "up", updatedAt: hoursAgo(0) },
];

export function getPulseItems(): PulseItem[] {
  return PULSE_ITEMS;
}

// -- Special cases --------------------------------------------------------

export const SPECIAL_CASES: SpecialCase[] = [
  {
    slug: "budget-1405",
    title: "پرونده ویژه: بودجه ۱۴۰۵",
    summary: "همه گزارش‌ها، تحلیل‌ها و داده‌های مدار مردم درباره لایحه بودجه سال ۱۴۰۵ در یک صفحه.",
    coverImage: { url: "/covers/budget.jpg", alt: "مجلس شورای اسلامی", width: 1600, height: 900 },
    startedAt: hoursAgo(240),
    sections: [
      { kind: "NEWS", label: "اخبار", articles: getArticlesByCategory("economy", 2) },
      { kind: "ANALYSIS", label: "تحلیل", articles: getArticlesByCategory("economy", 1) },
      { kind: "DATA", label: "داده", articles: getArticlesByCategory("data", 1) },
    ],
  },
];

export function getSpecialCaseBySlug(slug: string): SpecialCase | undefined {
  return SPECIAL_CASES.find((s) => s.slug === slug);
}

// -- Dashboard (reporter / editor / admin) ---------------------------------

/** Articles awaiting editorial review — separate from the published ARTICLES list above. */
export const PENDING_ARTICLES: NewsArticle[] = [
  {
    id: "art_p1",
    slug: "gasoline-quota-change-draft",
    kind: "NEWS",
    status: "PENDING_REVIEW",
    title: "تغییر سهمیه بنزین از هفته آینده اجرایی می‌شود",
    lead: "بر اساس مصوبه جدید، سهمیه بنزین خودروهای شخصی از هفته آینده تغییر می‌کند. این خبر هنوز در انتظار تأیید سردبیر است.",
    body: "<p>بر اساس مصوبه ستاد هدفمندی یارانه‌ها...</p>",
    coverImage: { url: "/covers/gasoline.jpg", alt: "پمپ بنزین", width: 1600, height: 900 },
    category: cat("economy"),
    tags: ["بنزین", "سهمیه‌بندی"],
    author: AUTHORS[0]!,
    publishedAt: hoursAgo(1),
    readingMinutes: 3,
    wordCount: 380,
    viewCount: 0,
  },
  {
    id: "art_p2",
    slug: "school-enrollment-report-draft",
    kind: "REPORT",
    status: "PENDING_REVIEW",
    title: "افت نرخ ثبت‌نام مدارس روستایی در سال تحصیلی جدید",
    lead: "گزارش میدانی از چند استان نشان می‌دهد نرخ ثبت‌نام در مدارس ابتدایی روستایی نسبت به سال گذشته کاهش داشته است.",
    body: "<p>بررسی‌های مدار مردم در سه استان...</p>",
    coverImage: { url: "/covers/school.jpg", alt: "مدرسه روستایی", width: 1600, height: 900 },
    category: cat("society"),
    tags: ["آموزش", "روستا"],
    author: AUTHORS[1]!,
    publishedAt: hoursAgo(5),
    readingMinutes: 7,
    wordCount: 1120,
    viewCount: 0,
  },
];

export function getPendingArticles(): NewsArticle[] {
  return PENDING_ARTICLES;
}

export const DASHBOARD_USERS: DashboardUser[] = [
  { id: "usr_1", name: "سارا احمدی", username: "sara-ahmadi", email: "sara@madaremardom.ir", role: "REPORTER", isActive: true, joinedAt: hoursAgo(24 * 400) },
  { id: "usr_2", name: "رضا کریمی", username: "reza-karimi", email: "reza@madaremardom.ir", role: "EDITOR", isActive: true, joinedAt: hoursAgo(24 * 600) },
  { id: "usr_3", name: "مینا جعفری", username: "mina-jafari", email: "mina@madaremardom.ir", role: "REPORTER", isActive: true, joinedAt: hoursAgo(24 * 200) },
  { id: "usr_4", name: "امیر رستمی", username: "amir-rostami", email: "amir@madaremardom.ir", role: "REPORTER", isActive: false, joinedAt: hoursAgo(24 * 150) },
  { id: "usr_5", name: "لیلا نوری", username: "leila-noori", email: "leila@madaremardom.ir", role: "ADMIN", isActive: true, joinedAt: hoursAgo(24 * 800) },
];

export function getDashboardUsers(): DashboardUser[] {
  return DASHBOARD_USERS;
}

export function getSiteStats(): SiteStats {
  return {
    totalArticles: ARTICLES.length + PENDING_ARTICLES.length,
    publishedThisWeek: ARTICLES.filter((a) => Date.now() - +new Date(a.publishedAt) < 7 * 86_400_000).length,
    activeReporters: DASHBOARD_USERS.filter((u) => u.role === "REPORTER" && u.isActive).length,
    pendingReview: PENDING_ARTICLES.length,
    totalViewsToday: ARTICLES.reduce((sum, a) => sum + Math.round(a.viewCount * 0.08), 0),
  };
}

