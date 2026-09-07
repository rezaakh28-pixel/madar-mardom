import { Star } from "lucide-react";
import { ArticleCard } from "@/components/news/article-card";
import type { NewsArticle } from "@/types";

/** "خبر ویژه" — the 3 admin/editor-picked articles, side by side under the hero headline, in a site-orange bordered box. */
export function FeaturedNewsRow({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="featured-news-heading" className="rounded-xl border-2 border-secondary p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Star className="h-4 w-4 fill-secondary text-secondary" />
        <h2 id="featured-news-heading" className="text-sm font-extrabold text-foreground">
          خبر ویژه
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
