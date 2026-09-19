import Link from "next/link";
import Image from "next/image";
import { Clock, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VideoEmbedFill } from "@/components/news/video-embed";
import { FitText } from "@/components/shared/fit-text";
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
   * 1-big + 2-small layout, next to the two small stacked cards.
   *
   * "large" and "horizontal" are both fixed-height, non-growing boxes (see
   * the height numbers below) — the title uses FitText (components/shared/
   * fit-text.tsx) to shrink its own font size until it fits within 2 lines,
   * instead of the box stretching to fit it. The two together are sized so
   * the big card always lands exactly as tall as the two small cards
   * stacked (208px = 2×96 + 16px gap on mobile, 240px = 2×112 + 16px gap on
   * sm+) — if either number changes, keep this relationship in mind.
   */
  orientation?: "vertical" | "horizontal" | "large";
  priority?: boolean;
}) {
  const isHorizontal = orientation === "horizontal";
  const isLarge = orientation === "large";
  // Video-category articles skip the cover image entirely — the video
  // itself plays right there instead. Small horizontal cards are too
  // cramped for a live player, so they get a static thumbnail with a play
  // badge instead (still links through to the article as usual).
  const isPlayableVideo = !!article.videoUrl && !isHorizontal;

  return (
    <Link
      href={`/news/${article.slug}`}
      className={`group flex overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md ${
        isHorizontal
          ? "h-24 flex-row items-stretch gap-3 sm:h-28"
          : isLarge
            ? "h-[208px] flex-col sm:h-[240px]"
            : "h-full flex-col"
      }`}
    >
      <div
        className={
          isHorizontal
            ? "relative h-full w-32 shrink-0 overflow-hidden sm:w-44"
            : isLarge
              ? "relative h-32 w-full shrink-0 overflow-hidden sm:h-40"
              : "relative aspect-[16/9] w-full"
        }
      >
        {isPlayableVideo ? (
          <VideoEmbedFill url={article.videoUrl!} title={article.title} />
        ) : (
          <Image
            src={article.coverImage.url}
            alt={article.coverImage.alt}
            fill
            sizes={isHorizontal ? "180px" : isLarge ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ objectPosition: article.coverImage.objectPosition || "center" }}
            priority={priority}
          />
        )}
        {isHorizontal && article.videoUrl && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-navy-900">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
          </span>
        )}
        {/* Video players sit on top of the card and would swallow clicks meant for badges/navigation, so keep badges out of their way by not layering them over a live player. */}
        {!isPlayableVideo && (
          <div className="absolute right-2 top-2 flex flex-wrap items-center gap-1.5">
            {article.isCitizenReport && <Badge variant="default">صدای مردم</Badge>}
            <Badge variant="secondary">{article.category.title}</Badge>
          </div>
        )}
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
          isHorizontal ? "justify-center gap-1 p-2.5" : isLarge ? "gap-1 p-2.5 sm:p-3" : "gap-2 p-4"
        }`}
      >
        {isPlayableVideo && (
          <div className="flex flex-wrap items-center gap-1.5">
            {article.isCitizenReport && <Badge variant="default">صدای مردم</Badge>}
            <Badge variant="secondary">{article.category.title}</Badge>
          </div>
        )}
        {isHorizontal ? (
          <FitText
            as="h3"
            maxLines={2}
            maxFontSize={13}
            minFontSize={9}
            className="text-balance font-bold leading-snug text-foreground group-hover:text-primary"
          >
            {article.title}
          </FitText>
        ) : isLarge ? (
          <FitText
            as="h3"
            maxLines={2}
            maxFontSize={16}
            minFontSize={11}
            className="text-balance font-bold leading-snug text-foreground group-hover:text-primary"
          >
            {article.title}
          </FitText>
        ) : (
          <h3 className="line-clamp-2 text-balance font-bold leading-snug text-foreground group-hover:text-primary">
            {article.title}
          </h3>
        )}
        {!isHorizontal && !isLarge && (
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
