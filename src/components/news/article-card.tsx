import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NewsArticle } from "@/types";
import { timeAgoFa, formatFa } from "@/lib/utils";

const KIND_LABEL_FA: Record<NewsArticle["kind"], string> = {
  NEWS: "خبر",
  ANALYSIS: "تحلیل",
  NOTE: "یادداشت",
  REPORT: "گزارش",
  DATA: "داده",
  VIDEO: "ویدیو",
  PODCAST: "پادکست",
  INFOGRAPHIC: "گزارش تصویری",
};

export function ArticleCard({
  article,
  orientation = "vertical",
  priority = false,
}: {
  article: NewsArticle;
  /**
   * "large" is the featured/latest-in-category card used in NewsSection's
   * 1-big + 2-small layout: same shape as "vertical" but stretches to fill
   * the height of the two stacked small cards beside it.
   */
  orientation?: "vertical" | "horizontal" | "large";
  priority?: boolean;
}) {
  const isHorizontal = orientation === "horizontal";
  const isLarge = orientation === "large";

  return (
    <Link
      href={`/news/${article.slug}`}
      className={`group flex h-full overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md ${
        isHorizontal ? "flex-row items-stretch gap-4" : "flex-col"
      }`}
    >
      <div
        className={
          isHorizontal
            ? "relative w-32 shrink-0 sm:w-44"
            : isLarge
              ? "relative w-full flex-1 min-h-[10rem]"
              : "relative aspect-[16/9] w-full"
        }
      >
        <Image
          src={article.coverImage.url}
          alt={article.coverImage.alt}
          fill
          sizes={isHorizontal ? "180px" : isLarge ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ objectPosition: article.coverImage.objectPosition || "center" }}
          priority={priority}
        />
        <div className="absolute right-2 top-2 flex flex-wrap items-center gap-1.5">
          {article.isCitizenReport && <Badge variant="default">صدای مردم</Badge>}
          <Badge variant="secondary">{article.category.title}</Badge>
        </div>
      </div>

      <div className={`flex flex-1 flex-col gap-2 p-4 ${isHorizontal ? "justify-center" : ""}`}>
        <h3
          className={`text-balance font-bold leading-snug text-foreground group-hover:text-primary ${
            isLarge ? "text-lg sm:text-xl" : ""
          }`}
        >
          {article.title}
        </h3>
        {!isHorizontal && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.lead}</p>
        )}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>{KIND_LABEL_FA[article.kind]}</span>
          <span aria-hidden>·</span>
          <span>{timeAgoFa(article.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatFa(article.readingMinutes)} دقیقه
          </span>
        </div>
      </div>
    </Link>
  );
}
