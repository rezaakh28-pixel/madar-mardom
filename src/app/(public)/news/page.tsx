import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ArticleCard } from "@/components/news/article-card";
import { getLatestArticles } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "اخبار",
  description: "آخرین اخبار مدار مردم درباره جامعه، اقتصاد، سیاست و زندگی روزمره ایرانیان.",
  path: "/news",
});

export default async function NewsIndexPage() {
  let articles: Awaited<ReturnType<typeof getLatestArticles>> = [];
  try {
    articles = await getLatestArticles(24);
  } catch {
    // Public pages degrade gracefully rather than crashing before a database is connected.
  }

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: "اخبار", href: "/news" }]} />

      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">اخبار</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">تازه‌ترین رویدادها، به‌ترتیب انتشار.</p>
      </header>

      {articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          هنوز خبری منتشر نشده است.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard key={article.id} article={article} priority={index < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
