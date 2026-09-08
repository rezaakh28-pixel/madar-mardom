"use client";

import * as React from "react";
import Link from "next/link";
import { TrendingUp, Clock } from "lucide-react";
import { formatFa, timeAgoFa } from "@/lib/utils";
import type { NewsArticle } from "@/types";

/** Splits a relative time into a value line ("۳ ساعت") and an "ago" line ("پیش"), so it can be stacked the same way as the view count. Falls back to a single line beyond 7 days. */
function timeAgoFaParts(date: Date | string): { value: string; unit: string } {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return { value: "لحظاتی", unit: "پیش" };
  if (diffMin < 60) return { value: `${formatFa(diffMin)} دقیقه`, unit: "پیش" };
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return { value: `${formatFa(diffHour)} ساعت`, unit: "پیش" };
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return { value: `${formatFa(diffDay)} روز`, unit: "پیش" };
  return { value: timeAgoFa(d), unit: "" };
}

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
        {articles.map((article, index) => {
          const timeParts = timeAgoFaParts(article.publishedAt);
          return (
            <li key={article.id}>
              <Link href={`/news/${article.slug}`} className="group flex items-center gap-3">
                {tab === "visited" ? (
                  <span className="font-numeral text-xl font-extrabold text-secondary/70 group-hover:text-secondary">
                    {formatFa(index + 1)}
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                )}

                <h3 className="min-w-0 flex-1 text-balance text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                  {article.title}
                </h3>

                {/* Stat block pinned to the far left of the row: value on top, unit below. */}
                <div className="flex shrink-0 flex-col items-center text-center leading-tight text-muted-foreground">
                  {tab === "visited" ? (
                    <>
                      <span className="font-numeral text-xs font-bold">{formatFa(article.viewCount)}</span>
                      <span className="text-[0.65rem]">بازدید</span>
                    </>
                  ) : (
                    <>
                      <span className="font-numeral text-xs font-bold">{timeParts.value}</span>
                      {timeParts.unit && <span className="text-[0.65rem]">{timeParts.unit}</span>}
                    </>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
