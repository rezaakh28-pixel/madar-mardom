import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ArticleCard } from "@/components/news/article-card";
import { getArticlesByCategory } from "@/lib/content";
import { getCategoryBySlug } from "@/lib/mock-data";
import type { CategorySlug } from "@/types";

export async function CategoryPage({ slug }: { slug: CategorySlug }) {
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  let articles: Awaited<ReturnType<typeof getArticlesByCategory>> = [];
  let dbError = false;
  try {
    articles = await getArticlesByCategory(slug);
  } catch {
    dbError = true;
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
