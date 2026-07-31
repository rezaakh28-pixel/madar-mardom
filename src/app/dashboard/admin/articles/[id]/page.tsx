import { notFound } from "next/navigation";
import { PublishedArticleEditForm } from "@/components/dashboard/published-article-edit-form";
import { db } from "@/lib/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminArticleEditPage({ params }: PageProps) {
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });

  if (!article) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">ویرایش خبر</h1>
      </header>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <PublishedArticleEditForm
          returnPath="/dashboard/admin/articles"
          article={{
            id: article.id,
            title: article.title,
            deck: article.deck ?? undefined,
            lead: article.lead,
            body: article.body,
            categorySlug: article.categorySlug,
          }}
        />
      </div>
    </div>
  );
}
