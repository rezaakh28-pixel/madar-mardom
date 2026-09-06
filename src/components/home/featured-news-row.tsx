import { ArticleCard } from "@/components/news/article-card";
import type { NewsArticle } from "@/types";

/** "خبر ویژه" — the 3 admin/editor-picked articles, side by side under the hero headline. */
export function FeaturedNewsRow({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
