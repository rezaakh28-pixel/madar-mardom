import Link from "next/link";
import { ArticleCard } from "@/components/news/article-card";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/types";

export function NewsSection({
  title,
  href,
  articles,
}: {
  title: string;
  href: string;
  articles: NewsArticle[];
}) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby={`section-${href}`} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 id={`section-${href}`} className="text-lg font-extrabold text-foreground sm:text-xl">
          {title}
        </h2>
        <Button variant="link" asChild className="h-auto p-0 text-sm">
          <Link href={href}>مشاهده همه</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
