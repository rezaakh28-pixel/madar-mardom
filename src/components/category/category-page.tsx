import { notFound, redirect } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ArticleCard } from "@/components/news/article-card";
import { Pagination } from "@/components/shared/pagination";
import { getArticlesByCategoryPaginated } from "@/lib/content";
import { getCategoryBySlug } from "@/lib/mock-data";
import type { CategorySlug, NewsArticle } from "@/types";

// 8 rows × 3 columns (the grid below is 3-wide on desktop) = 24 articles per page.
const PAGE_SIZE = 24;

export async function CategoryPage({ slug, page: pageParam }: { slug: CategorySlug; page?: string }) {
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const requestedPage = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  let articles: NewsArticle[] = [];
  let totalCount = 0;
  let dbError = false;
  try {
    const result = await getArticlesByCategoryPaginated(slug, requestedPage, PAGE_SIZE);
    articles = result.articles;
    totalCount = result.totalCount;
  } catch {
    dbError = true;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Someone requested a page past the last one (e.g. an old bookmarked link
  // after articles were unpublished) — send them to the last valid page
  // instead of showing a misleading "nothing published" empty state.
  if (!dbError && requestedPage > totalPages) {
    redirect(totalPages <= 1 ? `/${slug}` : `/${slug}?page=${totalPages}`);
  }

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: category.title, href: `/${category.slug}` }]} />

      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{category.title}</h1>
        {category.description && (
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{category.description}</p>
        )}
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          هنوز محتوایی در این بخش منتشر نشده است.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination currentPage={requestedPage} totalPages={totalPages} basePath={`/${category.slug}`} />
        </>
      )}
    </div>
  );
}
