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
  INFOGRAPHIC: "اینفوگرافیک",
};

export function ArticleCard({
  article,
  orientation = "vertical",
  priority = false,
}: {
  article: NewsArticle;
  orientation?: "vertical" | "horizontal";
  priority?: boolean;
}) {
  const isHorizontal = orientation === "horizontal";

  return (
    <Link
      href={`/news/${article.slug}`}
      className={`group flex overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md ${
        isHorizontal ? "flex-row items-stretch gap-4" : "flex-col"
      }`}
    >
      <div className={isHorizontal ? "relative w-32 shrink-0 sm:w-44" : "relative aspect-[16/9] w-full"}>
        <Image
          src={article.coverImage.url}
          alt={article.coverImage.alt}
          fill
          sizes={isHorizontal ? "180px" : "(min-width: 1024px) 33vw, 100vw"}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={priority}
        />
        <Badge variant="secondary" className="absolute right-2 top-2">
          {article.category.title}
        </Badge>
      </div>

      <div className={`flex flex-1 flex-col gap-2 p-4 ${isHorizontal ? "justify-center" : ""}`}>
        <h3 className="text-balance font-bold leading-snug text-foreground group-hover:text-primary">
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
