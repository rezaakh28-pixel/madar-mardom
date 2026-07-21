import { ArticleCard } from "@/components/news/article-card";
import type { NewsArticle } from "@/types";

export function RelatedArticles({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-10 border-t border-border pt-8">
      <h2 id="related-heading" className="mb-4 text-lg font-extrabold text-foreground">
        اخبار مرتبط
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
