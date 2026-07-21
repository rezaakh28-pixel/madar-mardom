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
  getPulseItems,
  getArticlesByCategory,
} from "@/lib/mock-data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "خانه",
  description:
    "مدار مردم، رسانه‌ای مستقل و مردمی: اخبار، تحلیل و داده‌های جامعه، اقتصاد و زندگی روزمره ایرانیان.",
  path: "/",
});

export default function HomePage() {
  const hero = getFeaturedArticle();
  const latest = getLatestArticles(6).filter((a) => a.slug !== hero.slug);
  const pulseItems = getPulseItems();
  const mostVisited = getMostVisited(5);

  const society = getArticlesByCategory("society", 3);
  const economy = getArticlesByCategory("economy", 3);
  const video = getArticlesByCategory("video", 3);

  return (
    <div className="container-page flex flex-col gap-10 py-8 sm:gap-14 sm:py-10">
      <HeroNews article={hero} />

      <PulseOfSociety items={pulseItems} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-10">
          <NewsSection title="آخرین اخبار" href="/news" articles={latest} />
          <NewsSection title="جامعه" href="/society" articles={society} />
          <NewsSection title="اقتصاد" href="/economy" articles={economy} />
          <NewsSection title="ویدیو" href="/video" articles={video} />
        </div>

        <aside className="flex flex-col gap-8">
          <MostVisited articles={mostVisited} />
        </aside>
      </div>

      <Newsletter />
    </div>
  );
}
