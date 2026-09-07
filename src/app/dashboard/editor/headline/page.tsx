import { HeroHeadlinePicker } from "@/components/dashboard/hero-headline-picker";
import { getAllPublishedArticles } from "@/lib/content";

export default async function EditorHeadlinePage() {
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
        <h1 className="text-xl font-extrabold text-foreground">تیتر اصلی</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          این خبر به‌صورت تیتر بزرگ بالای صفحه اصلی سایت نمایش داده می‌شود.
        </p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : (
        <HeroHeadlinePicker
          articles={articles.map((a) => ({
            id: a.id,
            title: a.title,
            categorySlug: a.categorySlug,
            isHeroHeadline: a.isHeroHeadline,
            publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
          }))}
        />
      )}
    </div>
  );
}
