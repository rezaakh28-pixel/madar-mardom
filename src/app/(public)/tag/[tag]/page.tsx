import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ArticleCard } from "@/components/news/article-card";
import { getArticlesByTag } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return buildPageMetadata({
    title: `برچسب #${tag}`,
    description: `اخبار مدار مردم با برچسب ${tag}.`,
    path: `/tag/${tag}`,
  });
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;

  let articles: Awaited<ReturnType<typeof getArticlesByTag>> = [];
  let dbError = false;
  try {
    articles = await getArticlesByTag(tag);
  } catch {
    dbError = true;
  }

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: `#${tag}`, href: `/tag/${tag}` }]} />

      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">#{tag}</h1>
        <p className="mt-1 text-sm text-muted-foreground">همه‌ی اخبار با این برچسب.</p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          خبری با این برچسب یافت نشد.
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
