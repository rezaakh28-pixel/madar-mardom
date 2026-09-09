import type { Metadata } from "next";
import { HeroHeadline } from "@/components/home/hero-headline";
import { FeaturedNewsRow } from "@/components/home/featured-news-row";
import { SpecialCaseBox } from "@/components/home/special-case-box";
import { VoiceCtaBox } from "@/components/home/voice-cta-box";
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

// Each box now shows a fixed layout of 3 articles (1 large + 2 small) with
// no expand button, so we only need to fetch 3 per section.
const SECTION_FETCH_LIMIT = 3;
// The "پربازدیدترین‌ها" / "آخرین اخبار" tabbed box shows 10 items per tab.
const MOST_VISITED_LIMIT = 10;
// "آخرین اخبار" excludes whatever is already shown as hero headline or
// featured news (up to 1 + 3 = 4 articles). Fetching only MOST_VISITED_LIMIT
// latest articles meant that after removing those overlaps, fewer than 10 —
// sometimes far fewer — were left, so recently-uploaded articles were
// silently missing from the tab. Fetch a bigger buffer to guarantee enough
// remain after filtering.
const LATEST_FETCH_LIMIT = MOST_VISITED_LIMIT + 15;

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
  let sports: NewsArticle[];
  let provinces: NewsArticle[];
  let analysis: NewsArticle[];
  let notes: NewsArticle[];
  let reports: NewsArticle[];
  let data: NewsArticle[];
  let video: NewsArticle[];
  let podcast: NewsArticle[];
  let infographic: NewsArticle[];
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
      sports,
      provinces,
      analysis,
      notes,
      reports,
      data,
      video,
      podcast,
      infographic,
      citizenReports,
      ads,
      specialCase,
    ] = await Promise.all([
      getHeroHeadline(),
      getFeaturedArticles(),
      getLatestArticles(LATEST_FETCH_LIMIT),
      getPulseItems(),
      getMostVisited(MOST_VISITED_LIMIT),
      getArticlesByCategory("society", SECTION_FETCH_LIMIT),
      getArticlesByCategory("economy", SECTION_FETCH_LIMIT),
      getArticlesByCategory("politics", SECTION_FETCH_LIMIT),
      getArticlesByCategory("world", SECTION_FETCH_LIMIT),
      getArticlesByCategory("sports", SECTION_FETCH_LIMIT),
      getArticlesByCategory("provinces", SECTION_FETCH_LIMIT),
      getArticlesByCategory("analysis", SECTION_FETCH_LIMIT),
      getArticlesByCategory("notes", SECTION_FETCH_LIMIT),
      getArticlesByCategory("reports", SECTION_FETCH_LIMIT),
      getArticlesByCategory("data", SECTION_FETCH_LIMIT),
      getArticlesByCategory("video", SECTION_FETCH_LIMIT),
      getArticlesByCategory("podcast", SECTION_FETCH_LIMIT),
      getArticlesByCategory("infographic", SECTION_FETCH_LIMIT),
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
    sports = [];
    provinces = [];
    analysis = [];
    notes = [];
    reports = [];
    data = [];
    video = [];
    podcast = [];
    infographic = [];
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
  const latestExcludingFeatured =
    usedSlugs.size > 0 ? latest.filter((a) => !usedSlugs.has(a.slug)).slice(0, MOST_VISITED_LIMIT) : latest;

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

      {/*
        A single grid for the whole body: the main (right, 2fr) column holds
        the featured-news box AND every category section stacked directly
        below it, so the sidebar's height (special case + voice cta + most
        visited + ads) never leaves a gap in the main column — previously
        this was two separate grids, and because the sidebar was taller than
        the featured-news box, the category sections (starting with "جامعه")
        were pushed far down below "خبر ویژه" with a big empty gap above them.
      */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <FeaturedNewsRow articles={displayedFeaturedNews} />
          <NewsSection title="صدای مردم" href="/citizen-reports" articles={citizenReports} />
          <NewsSection title="جامعه" href="/society" articles={society} />
          <NewsSection title="اقتصاد" href="/economy" articles={economy} />
          <NewsSection title="سیاست" href="/politics" articles={politics} />
          <NewsSection title="جهان" href="/world" articles={world} />
          <NewsSection title="ورزشی" href="/sports" articles={sports} />
          <NewsSection title="استان‌ها" href="/provinces" articles={provinces} />
          <NewsSection title="تحلیل" href="/analysis" articles={analysis} />
          <NewsSection title="یادداشت" href="/notes" articles={notes} />
          <NewsSection title="گزارش" href="/reports" articles={reports} />
          <NewsSection title="داده" href="/data" articles={data} />
          <NewsSection title="ویدیو" href="/video" articles={video} />
          <NewsSection title="پادکست" href="/podcast" articles={podcast} />
          <NewsSection title="گزارش تصویری" href="/infographic" articles={infographic} />
        </div>

        <aside className="flex flex-col gap-6">
          <SpecialCaseBox specialCase={specialCase} />
          <VoiceCtaBox />
          {mostVisited.length > 0 && (
            <MostVisited mostVisited={mostVisited} latest={latestExcludingFeatured.slice(0, MOST_VISITED_LIMIT)} />
          )}
          <AdBox ads={ads} />
        </aside>
      </div>

      <Newsletter />
    </div>
  );
}
