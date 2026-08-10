import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ArticleCard } from "@/components/news/article-card";
import { searchArticles } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return buildPageMetadata({
    title: q ? `جست‌وجو: ${q}` : "جست‌وجو",
    description: "جست‌وجو در اخبار، تحلیل‌ها و گزارش‌های مدار مردم.",
    path: "/search",
  });
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let articles: Awaited<ReturnType<typeof searchArticles>> = [];
  let dbError = false;

  if (query) {
    try {
      articles = await searchArticles(query);
    } catch {
      dbError = true;
    }
  }

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: "جست‌وجو", href: "/search" }]} />

      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
          {query ? `نتایج جست‌وجو برای «${query}»` : "جست‌وجو"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">جست‌وجو در تیتر، متن و برچسب اخبار.</p>
      </header>

      {!query ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          عبارتی برای جست‌وجو وارد کنید.
        </p>
      ) : dbError ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          نتیجه‌ای برای «{query}» یافت نشد.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
