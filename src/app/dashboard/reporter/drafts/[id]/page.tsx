import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/dashboard/article-form";
import { getArticleForOwner } from "@/lib/content";
import { getSession } from "@/lib/session";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDraftPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();
  const article = await getArticleForOwner(id, session!.user.id).catch(() => null);

  if (!article) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">ویرایش پیش‌نویس</h1>
        <p className="mt-1 text-sm text-muted-foreground">تغییرات را ذخیره کنید یا مستقیماً برای سردبیر بفرستید.</p>
      </header>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <ArticleForm
          initialArticle={{
            id: article.id,
            title: article.title,
            deck: article.deck ?? undefined,
            lead: article.lead,
            body: article.body,
            category: article.categorySlug,
            tags: article.tags,
            coverImageUrl: article.coverImageUrl ?? undefined,
          }}
        />
      </div>
    </div>
  );
}
