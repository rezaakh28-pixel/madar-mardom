"use client";

import * as React from "react";
import Link from "next/link";
import { TrendingUp, Clock } from "lucide-react";
import { formatFa, timeAgoFa } from "@/lib/utils";
import type { NewsArticle } from "@/types";

type Tab = "visited" | "latest";

/**
 * Two-tab box: "پربازدیدترین‌ها" and "آخرین اخبار" (moved here from its own
 * separate section further down the homepage) — same box, switched with the
 * two buttons at the top.
 */
export function MostVisited({ mostVisited, latest }: { mostVisited: NewsArticle[]; latest: NewsArticle[] }) {
  const [tab, setTab] = React.useState<Tab>("visited");
  const articles = tab === "visited" ? mostVisited : latest;

  return (
    <section
      aria-labelledby="most-visited-heading"
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab("visited")}
          className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 p-4 text-sm font-extrabold transition-colors ${
            tab === "visited"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span id="most-visited-heading">پربازدیدترین‌ها</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("latest")}
          className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 p-4 text-sm font-extrabold transition-colors ${
            tab === "latest"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          آخرین اخبار
        </button>
      </div>

      <ol className="flex flex-1 flex-col gap-4 p-4">
        {articles.map((article, index) => (
          <li key={article.id}>
            <Link href={`/news/${article.slug}`} className="group flex items-start gap-3">
              {tab === "visited" ? (
                <span className="font-numeral text-xl font-extrabold text-secondary/70 group-hover:text-secondary">
                  {formatFa(index + 1)}
                </span>
              ) : (
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
              )}
              <div className="flex flex-col gap-1">
                <h3 className="text-balance text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                  {article.title}
                </h3>
                <span className="font-numeral text-xs text-muted-foreground">
                  {tab === "visited" ? `${formatFa(article.viewCount)} بازدید` : timeAgoFa(article.publishedAt)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
