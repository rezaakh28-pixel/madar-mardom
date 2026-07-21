import Link from "next/link";
import { formatFa } from "@/lib/utils";
import type { NewsArticle } from "@/types";

export function MostVisited({ articles }: { articles: NewsArticle[] }) {
  return (
    <section aria-labelledby="most-visited-heading" className="rounded-xl border border-border bg-card p-5">
      <h2 id="most-visited-heading" className="mb-4 text-lg font-extrabold text-foreground">
        پربازدیدترین‌ها
      </h2>
      <ol className="flex flex-col gap-4">
        {articles.map((article, index) => (
          <li key={article.id}>
            <Link href={`/news/${article.slug}`} className="group flex items-start gap-3">
              <span className="font-numeral text-xl font-extrabold text-secondary/70 group-hover:text-secondary">
                {formatFa(index + 1)}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-balance text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                  {article.title}
                </h3>
                <span className="font-numeral text-xs text-muted-foreground">
                  {formatFa(article.viewCount)} بازدید
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
