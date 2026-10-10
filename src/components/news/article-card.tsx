import Link from "next/link";
import Image from "next/image";
import { Clock, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VideoEmbedFill } from "@/components/news/video-embed";
import { FitText } from "@/components/shared/fit-text";
import { TitleLeadFit } from "@/components/shared/title-lead-fit";
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
   * Every image/video slot is a true 16:9 box on every device, zoom level
   * and browser: it's sized only with CSS aspect-ratio from its own width,
   * never with a fixed height (a fixed height + fluid width is what made
   * images look stretched/cropped differently per screen). Nothing stretches
   * an image to match a neighbour — where a neighbour is taller/shorter, the
   * *text* areas absorb the difference instead.
   *  - "horizontal": image is 42% of the card width at 16:9, and the card is
   *    exactly as tall as that image (the text column is h-0/min-h-full so
   *    it can't make the row taller; FitText shrinks the title to fit).
   *  - "large": 16:9 image on top, text area fills whatever height the grid
   *    row gives the card.
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
      className={`group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md ${
        isHorizontal ? "grid grid-cols-[42%_1fr] items-stretch" : "flex h-full flex-col"
      }`}
    >
      <div
        className={
          isHorizontal
            ? "relative aspect-[16/9] w-full self-start overflow-hidden"
            : "relative aspect-[16/9] w-full shrink-0 overflow-hidden"
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
        className={`flex min-h-0 flex-col overflow-hidden ${
          isHorizontal
            ? "h-0 min-h-full min-w-0 justify-center gap-1 p-2"
            : isLarge
              ? "flex-1 gap-1 p-2.5 sm:p-3"
              : "flex-1 gap-2 p-4"
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
          <TitleLeadFit
            title={article.title}
            lead={article.lead}
            titleMaxLines={2}
            titleMaxFontSize={16}
            titleMinFontSize={11}
            titleClassName="text-balance font-bold leading-snug text-foreground group-hover:text-primary"
            leadMaxLines={1}
            leadOffset={3}
            leadMinFontSize={9}
            leadClassName="leading-snug text-muted-foreground"
          />
        ) : (
          <TitleLeadFit
            title={article.title}
            lead={article.lead}
            titleMaxLines={2}
            titleMaxFontSize={18}
            titleMinFontSize={13}
            titleClassName="text-balance font-bold leading-snug text-foreground group-hover:text-primary"
            leadMaxLines={2}
            leadOffset={4}
            leadMinFontSize={11}
            leadClassName="leading-relaxed text-muted-foreground"
          />
        )}
        <div className="mt-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>{KIND_LABEL_FA[article.kind]}</span>
          <span aria-hidden>·</span>
          <span>{timeAgoFa(article.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {formatFa(article.readingMinutes)} دقیقه
          </span>
        </div>
      </div>
    </Link>
  );
}
