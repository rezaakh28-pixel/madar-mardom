import { FeaturedArticlePicker } from "@/components/dashboard/featured-article-picker";
import { HeroHeadlinePicker } from "@/components/dashboard/hero-headline-picker";
import { getAllPublishedArticles } from "@/lib/content";

export default async function AdminFeaturedPage() {
  let articles: Awaited<ReturnType<typeof getAllPublishedArticles>> = [];
  let dbError = false;

  try {
    articles = await getAllPublishedArticles();
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <header>
          <h1 className="text-xl font-extrabold text-foreground">تیتر اصلی</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            این خبر به‌صورت تیتر بزرگ بالای صفحه اصلی سایت نمایش داده می‌شود.
          </p>
        </header>

        {!dbError && (
          <div className="mt-6">
            <HeroHeadlinePicker
              articles={articles.map((a) => ({
                id: a.id,
                title: a.title,
                categorySlug: a.categorySlug,
                isHeroHeadline: a.isHeroHeadline,
                publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
              }))}
            />
          </div>
        )}
      </div>

      <div>
        <header>
          <h2 className="text-xl font-extrabold text-foreground">خبر ویژه</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            سه خبر ویژه‌ای که اینجا انتخاب می‌کنید کنار هم، زیر تیتر اصلی صفحه اصلی سایت نمایش داده می‌شوند.
          </p>
        </header>

        {dbError ? (
          <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            اتصال به پایگاه‌داده برقرار نیست.
          </p>
        ) : (
          <div className="mt-6">
            <FeaturedArticlePicker
              articles={articles.map((a) => ({
                id: a.id,
                title: a.title,
                categorySlug: a.categorySlug,
                featuredRank: a.featuredRank,
                publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
