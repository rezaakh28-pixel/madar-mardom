import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ArticleCard } from "@/components/news/article-card";
import { getCitizenReports } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "صدای مردم",
  description:
    "گزارش‌ها، عکس‌ها و روایت‌های ارسالی مردم که پس از بررسی و ویرایش سردبیران مدار مردم منتشر شده‌اند.",
  path: "/citizen-reports",
});

export default async function CitizenReportsPage() {
  let articles: Awaited<ReturnType<typeof getCitizenReports>> = [];
  let dbError = false;

  try {
    articles = await getCitizenReports();
  } catch {
    dbError = true;
  }

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: "صدای مردم", href: "/citizen-reports" }]} />

      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">صدای مردم</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          روایت‌ها و گزارش‌هایی که خودِ مردم ارسال کرده‌اند و پس از بررسی و ویرایش تحریریه‌ی مدار مردم منتشر شده‌اند.
        </p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          هنوز گزارش مردمی‌ای منتشر نشده است.
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
