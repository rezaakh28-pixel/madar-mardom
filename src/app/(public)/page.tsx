import type { Metadata } from "next";
import { HeroNews } from "@/components/home/hero-news";
import { PulseOfSociety } from "@/components/home/pulse-of-society";
import { NewsSection } from "@/components/home/news-section";
import { MostVisited } from "@/components/home/most-visited";
import { Newsletter } from "@/components/home/newsletter";
import {
  getFeaturedArticle,
  getLatestArticles,
  getMostVisited,
  getArticlesByCategory,
} from "@/lib/content";
import { getPulseItems } from "@/lib/pulse";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "خانه",
  description:
    "مدار مردم، رسانه‌ای مستقل و مردمی: اخبار، تحلیل و داده‌های جامعه، اقتصاد و زندگی روزمره ایرانیان.",
  path: "/",
});

export default async function HomePage() {
  let hero, latest, pulseItems, mostVisited, society, economy, video;
  let dbError = false;

  try {
    [hero, latest, pulseItems, mostVisited, society, economy, video] = await Promise.all([
      getFeaturedArticle(),
      getLatestArticles(7),
      getPulseItems(),
      getMostVisited(5),
      getArticlesByCategory("society", 3),
      getArticlesByCategory("economy", 3),
      getArticlesByCategory("video", 3),
    ]);
  } catch {
    dbError = true;
    hero = null;
    latest = [];
    pulseItems = [];
    mostVisited = [];
    society = [];
    economy = [];
    video = [];
  }

  const latestExcludingHero = hero ? latest.filter((a) => a.slug !== hero.slug).slice(0, 6) : latest;

  return (
    <div className="container-page flex flex-col gap-10 py-8 sm:gap-14 sm:py-10">
      {dbError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      )}

      {hero ? (
        <HeroNews article={hero} />
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
          <NewsSection title="جامعه" href="/society" articles={society} />
          <NewsSection title="اقتصاد" href="/economy" articles={economy} />
          <NewsSection title="ویدیو" href="/video" articles={video} />
        </div>

        <aside className="flex flex-col gap-8">
          {mostVisited.length > 0 && <MostVisited articles={mostVisited} />}
        </aside>
      </div>

      <Newsletter />
    </div>
  );
}
