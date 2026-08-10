"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ArticleCard } from "@/components/news/article-card";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/types";

const INITIAL_COUNT = 3;

export function NewsSection({
  title,
  href,
  articles,
}: {
  title: string;
  href: string;
  articles: NewsArticle[];
}) {
  const [expanded, setExpanded] = React.useState(false);

  if (articles.length === 0) return null;

  const visible = expanded ? articles : articles.slice(0, INITIAL_COUNT);
  const hasMore = articles.length > INITIAL_COUNT;

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
        {visible.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      {!expanded && hasMore && (
        <Button variant="outline" className="mx-auto gap-1.5" onClick={() => setExpanded(true)}>
          <ChevronDown className="h-4 w-4" />
          نمایش {Math.min(6, articles.length - INITIAL_COUNT) === 6 ? "۶" : articles.length - INITIAL_COUNT} خبر بعدی
        </Button>
      )}
    </section>
  );
}
