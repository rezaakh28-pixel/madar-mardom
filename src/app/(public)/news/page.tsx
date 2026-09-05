import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ArticleCard } from "@/components/news/article-card";
import { Pagination } from "@/components/shared/pagination";
import { getLatestArticlesPaginated } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "اخبار",
  description: "آخرین اخبار مدار مردم درباره جامعه، اقتصاد، سیاست و زندگی روزمره ایرانیان.",
  path: "/news",
});

// 8 rows × 3 columns (the grid below is 3-wide on desktop) = 24 articles per page.
const PAGE_SIZE = 24;

export default async function NewsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  let articles: Awaited<ReturnType<typeof getLatestArticlesPaginated>>["articles"] = [];
  let totalCount = 0;
  let dbError = false;
  try {
    const result = await getLatestArticlesPaginated(requestedPage, PAGE_SIZE);
    articles = result.articles;
    totalCount = result.totalCount;
  } catch {
    dbError = true;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (!dbError && requestedPage > totalPages) {
    redirect(totalPages <= 1 ? "/news" : `/news?page=${totalPages}`);
  }

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: "اخبار", href: "/news" }]} />

      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">اخبار</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">تازه‌ترین رویدادها، به‌ترتیب انتشار.</p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          هنوز خبری منتشر نشده است.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <ArticleCard key={article.id} article={article} priority={index < 3} />
            ))}
          </div>
          <Pagination currentPage={requestedPage} totalPages={totalPages} basePath="/news" />
        </>
      )}
    </div>
  );
}
