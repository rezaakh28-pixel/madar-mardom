import { notFound } from "next/navigation";
import { SpecialCaseArticlesManager } from "@/components/dashboard/special-case-articles-manager";
import { getSpecialCaseWithArticles, getAllPublishedArticles } from "@/lib/content";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSpecialCaseDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [specialCase, allArticles] = await Promise.all([
    getSpecialCaseWithArticles(id),
    getAllPublishedArticles(),
  ]);

  if (!specialCase) notFound();

  const assignedIds = new Set(specialCase.articles.map((a) => a.id));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">{specialCase.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{specialCase.summary}</p>
      </header>

      <SpecialCaseArticlesManager
        specialCaseId={specialCase.id}
        assigned={specialCase.articles.map((a) => ({ id: a.id, title: a.title, categorySlug: a.categorySlug }))}
        available={allArticles
          .filter((a) => !assignedIds.has(a.id))
          .map((a) => ({ id: a.id, title: a.title, categorySlug: a.categorySlug }))}
      />
    </div>
  );
}
