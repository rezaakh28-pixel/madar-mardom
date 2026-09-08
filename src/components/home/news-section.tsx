import Link from "next/link";
import { ArticleCard } from "@/components/news/article-card";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/types";

/**
 * Category box: the latest article in the category shown large on the left,
 * and the next two most recent shown small, stacked on the right. Fixed to
 * these 3 — no "show more" expand button.
 */
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

  // noUncheckedIndexedAccess makes indexed access `T | undefined` even after
  // the length check above, so assert non-null — we know it's safe here.
  const big = articles[0]!;
  const small = articles.slice(1, 3);

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

      <div className={`grid grid-cols-1 gap-4 ${small.length > 0 ? "sm:grid-cols-[1fr_2fr]" : ""}`}>
        {small.length > 0 && (
          <div className="order-2 flex flex-col gap-4 sm:order-1">
            {small.map((article) => (
              <ArticleCard key={article.id} article={article} orientation="horizontal" />
            ))}
          </div>
        )}
        <div className="order-1 sm:order-2">
          <ArticleCard article={big} orientation="large" />
        </div>
      </div>
    </section>
  );
}
