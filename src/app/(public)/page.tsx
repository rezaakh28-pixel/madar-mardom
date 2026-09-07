import type { Metadata } from "next";
import { HeroHeadline } from "@/components/home/hero-headline";
import { FeaturedNewsRow } from "@/components/home/featured-news-row";
import { SpecialCaseBox } from "@/components/home/special-case-box";
import { PulseTicker } from "@/components/home/pulse-ticker";
import { NewsSection } from "@/components/home/news-section";
import { MostVisited } from "@/components/home/most-visited";
import { AdBox } from "@/components/home/ad-box";
import { Newsletter } from "@/components/home/newsletter";
import {
  getHeroHeadline,
  getFeaturedArticles,
  getLatestArticles,
  getMostVisited,
  getArticlesByCategory,
  getCitizenReports,
  getLatestSpecialCase,
} from "@/lib/content";
import { getPulseItems } from "@/lib/pulse";
import { getActiveAds } from "@/lib/ads";
import { buildPageMetadata } from "@/lib/seo";
import type { NewsArticle, PulseItem } from "@/types";
import type { AdBanner } from "@/lib/ads";
import type { HomeSpecialCase } from "@/lib/content";

export const metadata: Metadata = buildPageMetadata({
  title: "خانه",
  description:
    "مدار مردم، رسانه‌ای مستقل و مردمی: اخبار، تحلیل و داده‌های جامعه، اقتصاد و زندگی روزمره ایرانیان.",
  path: "/",
});

// Each box shows 3 articles initially, with a "show 6 more" button — so we
// fetch 9 per section (3 initial + up to 6 more) to avoid a second round trip.
const SECTION_FETCH_LIMIT = 9;
// A single "پربازدیدترین‌ها" / "آخرین اخبار" tabbed box now lives beside the
// special-case box near the top — kept to 8 per tab so it stays roughly the
// same size as the special-case box beside it.
const MOST_VISITED_LIMIT = 8;

export default async function HomePage() {
  let heroHeadline: NewsArticle | null;
  let featuredNews: NewsArticle[];
  let latest: NewsArticle[];
  let pulseItems: PulseItem[];
  let mostVisited: NewsArticle[];
  let society: NewsArticle[];
  let economy: NewsArticle[];
  let politics: NewsArticle[];
  let world: NewsArticle[];
  let video: NewsArticle[];
  let citizenReports: NewsArticle[];
  let ads: AdBanner[];
  let specialCase: HomeSpecialCase | null;
  let dbError = false;

  try {
    [
      heroHeadline,
      featuredNews,
      latest,
      pulseItems,
      mostVisited,
      society,
      economy,
      politics,
      world,
      video,
      citizenReports,
      ads,
      specialCase,
    ] = await Promise.all([
      getHeroHeadline(),
      getFeaturedArticles(),
      getLatestArticles(10),
      getPulseItems(),
      getMostVisited(MOST_VISITED_LIMIT),
      getArticlesByCategory("society", SECTION_FETCH_LIMIT),
      getArticlesByCategory("economy", SECTION_FETCH_LIMIT),
      getArticlesByCategory("politics", SECTION_FETCH_LIMIT),
      getArticlesByCategory("world", SECTION_FETCH_LIMIT),
      getArticlesByCategory("video", SECTION_FETCH_LIMIT),
      getCitizenReports(SECTION_FETCH_LIMIT),
      getActiveAds(),
      getLatestSpecialCase(),
    ]);
  } catch {
    dbError = true;
    heroHeadline = null;
    featuredNews = [];
    latest = [];
    pulseItems = [];
    mostVisited = [];
    society = [];
    economy = [];
    politics = [];
    world = [];
    video = [];
    citizenReports = [];
    ads = [];
    specialCase = null;
  }

  const displayedFeaturedNews = heroHeadline
    ? featuredNews.filter((a) => a.slug !== heroHeadline!.slug)
    : featuredNews;

  const usedSlugs = new Set([
    ...(heroHeadline ? [heroHeadline.slug] : []),
    ...displayedFeaturedNews.map((a) => a.slug),
  ]);
  const latestExcludingFeatured = usedSlugs.size > 0 ? latest.filter((a) => !usedSlugs.has(a.slug)).slice(0, 9) : latest;

  return (
    <div className="container-page flex flex-col gap-10 py-8 sm:gap-14 sm:py-10">
      {dbError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      )}

      {pulseItems.length > 0 && <PulseTicker items={pulseItems} />}

      {heroHeadline ? (
        <HeroHeadline article={heroHeadline} />
      ) : (
        !dbError && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            هنوز خبری منتشر نشده است. اولین خبر را از پنل خبرنگار ارسال کنید.
          </div>
        )
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <FeaturedNewsRow articles={displayedFeaturedNews} />
        <div className="flex flex-col gap-6">
          <SpecialCaseBox specialCase={specialCase} />
          {mostVisited.length > 0 && (
            <MostVisited mostVisited={mostVisited} latest={latestExcludingFeatured.slice(0, MOST_VISITED_LIMIT)} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-10">
          <NewsSection title="گزارشات مردمی" href="/citizen-reports" articles={citizenReports} />
          <NewsSection title="جامعه" href="/society" articles={society} />
          <NewsSection title="اقتصاد" href="/economy" articles={economy} />
          <NewsSection title="سیاست" href="/politics" articles={politics} />
          <NewsSection title="جهان" href="/world" articles={world} />
          <NewsSection title="ویدیو" href="/video" articles={video} />
        </div>

        <aside className="flex flex-col gap-8">
          <AdBox ads={ads} />
        </aside>
      </div>

      <Newsletter />
    </div>
  );
}
