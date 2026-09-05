import type { Metadata } from "next";
import { HeroNews } from "@/components/home/hero-news";
import { PulseOfSociety } from "@/components/home/pulse-of-society";
import { NewsSection } from "@/components/home/news-section";
import { MostVisited } from "@/components/home/most-visited";
import { AdBox } from "@/components/home/ad-box";
import { Newsletter } from "@/components/home/newsletter";
import {
  getFeaturedArticles,
  getLatestArticles,
  getMostVisited,
  getArticlesByCategory,
  getCitizenReports,
} from "@/lib/content";
import { getPulseItems } from "@/lib/pulse";
import { getActiveAds } from "@/lib/ads";
import { buildPageMetadata } from "@/lib/seo";
import type { NewsArticle, PulseItem } from "@/types";
import type { AdBanner } from "@/lib/ads";

export const metadata: Metadata = buildPageMetadata({
  title: "خانه",
  description:
    "مدار مردم، رسانه‌ای مستقل و مردمی: اخبار، تحلیل و داده‌های جامعه، اقتصاد و زندگی روزمره ایرانیان.",
  path: "/",
});

// Each box shows 3 articles initially, with a "show 6 more" button — so we
// fetch 9 per section (3 initial + up to 6 more) to avoid a second round trip.
const SECTION_FETCH_LIMIT = 9;

export default async function HomePage() {
  let hero: NewsArticle[];
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
  let dbError = false;

  try {
    [hero, latest, pulseItems, mostVisited, society, economy, politics, world, video, citizenReports, ads] =
      await Promise.all([
        getFeaturedArticles(),
        getLatestArticles(10),
        getPulseItems(),
        getMostVisited(10),
        getArticlesByCategory("society", SECTION_FETCH_LIMIT),
        getArticlesByCategory("economy", SECTION_FETCH_LIMIT),
        getArticlesByCategory("politics", SECTION_FETCH_LIMIT),
        getArticlesByCategory("world", SECTION_FETCH_LIMIT),
        getArticlesByCategory("video", SECTION_FETCH_LIMIT),
        getCitizenReports(SECTION_FETCH_LIMIT),
        getActiveAds(),
      ]);
  } catch {
    dbError = true;
    hero = [];
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
  }

  const heroSlugs = new Set(hero.map((a) => a.slug));
  const latestExcludingHero = hero.length > 0 ? latest.filter((a) => !heroSlugs.has(a.slug)).slice(0, 9) : latest;

  return (
    <div className="container-page flex flex-col gap-10 py-8 sm:gap-14 sm:py-10">
      {dbError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      )}

      {hero.length > 0 ? (
        <HeroNews articles={hero} />
      ) : (
        !dbError && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            هنوز خبری منتشر نشده است. اولین خبر را از پنل خبرنگار ارسال کنید.
          </div>
        )
      )}

      {pulseItems.length > 0 && <PulseOfSociety items={pulseItems} />}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-10">
          <NewsSection title="آخرین اخبار" href="/news" articles={latestExcludingHero} />
          <NewsSection title="گزارشات مردمی" href="/citizen-reports" articles={citizenReports} />
          <NewsSection title="جامعه" href="/society" articles={society} />
          <NewsSection title="اقتصاد" href="/economy" articles={economy} />
          <NewsSection title="سیاست" href="/politics" articles={politics} />
          <NewsSection title="جهان" href="/world" articles={world} />
          <NewsSection title="ویدیو" href="/video" articles={video} />
        </div>

        <aside className="flex flex-col gap-8">
          {mostVisited.length > 0 && <MostVisited articles={mostVisited} />}
          <AdBox ads={ads} />
        </aside>
      </div>

      <Newsletter />
    </div>
  );
}
