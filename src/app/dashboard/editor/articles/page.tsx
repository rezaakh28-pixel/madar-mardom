import { AllArticlesList } from "@/components/dashboard/all-articles-list";
import { getAllPublishedArticles } from "@/lib/content";

export default async function EditorArticlesPage() {
  let articles: Awaited<ReturnType<typeof getAllPublishedArticles>> = [];
  let dbError = false;

  try {
    articles = await getAllPublishedArticles();
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">همه اخبار منتشرشده</h1>
        <p className="mt-1 text-sm text-muted-foreground">مشاهده، ویرایش یا حذف هر خبر منتشرشده در سایت.</p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : (
        <AllArticlesList
          basePath="/dashboard/editor/articles"
          articles={articles.map((a) => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            categorySlug: a.categorySlug,
            authorName: a.author.name,
            publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
            viewCount: a.viewCount,
          }))}
        />
      )}
    </div>
  );
}
