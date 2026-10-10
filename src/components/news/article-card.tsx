import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VideoEmbedFill } from "@/components/news/video-embed";
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
   * "large" and "small" are the two card sizes of NewsSection's 1-big +
   * 2-small layout. They share the same form — a true 16:9 image on top,
   * title and lead below — and differ only in font-size ranges and padding.
   *
   * The image slot is sized purely with CSS aspect-ratio from its own width,
   * never with a fixed height, so it stays 16:9 on every device/zoom/browser.
   * Nothing stretches an image to match a neighbour: the text area (flex-1)
   * absorbs any extra height, so cards sharing a column fill it with no gaps.
   */
  orientation?: "vertical" | "large" | "small";
  priority?: boolean;
}) {
  const isLarge = orientation === "large";
  const isSmall = orientation === "small";
  // Video-category articles skip the cover image entirely — the video
  // itself plays right there instead (still links through via the text).
  const isPlayableVideo = !!article.videoUrl;

  const badges = (
    <div className="flex flex-wrap items-center gap-1.5">
      {article.isCitizenReport && <Badge variant="default">صدای مردم</Badge>}
      <Badge variant="secondary">{article.category.title}</Badge>
    </div>
  );

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
        {isPlayableVideo ? (
          <VideoEmbedFill url={article.videoUrl!} title={article.title} />
        ) : (
          <Image
            src={article.coverImage.url}
            alt={article.coverImage.alt}
            fill
            sizes={isSmall ? "(min-width: 1024px) 20vw, 50vw" : isLarge ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ objectPosition: article.coverImage.objectPosition || "center" }}
            priority={priority}
          />
        )}
        {/* A live video player would swallow clicks meant for badges, so badges only overlay still images. */}
        {!isPlayableVideo && <div className="absolute right-2 top-2">{badges}</div>}
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
          isSmall ? "gap-1 p-2" : isLarge ? "gap-2 p-3 sm:p-4" : "gap-2 p-4"
        }`}
      >
        {isPlayableVideo && badges}
        {isSmall ? (
          <TitleLeadFit
            title={article.title}
            lead={article.lead}
            titleMaxLines={2}
            titleMaxFontSize={14}
            titleMinFontSize={10}
            titleClassName="shrink-0 text-balance font-bold leading-snug text-foreground group-hover:text-primary"
            leadMaxLines={1}
            leadOffset={3}
            leadMinFontSize={9}
            leadClassName="leading-snug text-muted-foreground"
          />
        ) : isLarge ? (
          <TitleLeadFit
            title={article.title}
            lead={article.lead}
            titleMaxLines={3}
            titleMaxFontSize={24}
            titleMinFontSize={14}
            titleClassName="shrink-0 text-balance font-bold leading-snug text-foreground group-hover:text-primary"
            leadMaxLines={4}
            leadOffset={6}
            leadMinFontSize={11}
            leadClassName="shrink-0 leading-relaxed text-muted-foreground"
          />
        ) : (
          <TitleLeadFit
            title={article.title}
            lead={article.lead}
            titleMaxLines={2}
            titleMaxFontSize={18}
            titleMinFontSize={13}
            titleClassName="shrink-0 text-balance font-bold leading-snug text-foreground group-hover:text-primary"
            leadMaxLines={2}
            leadOffset={4}
            leadMinFontSize={11}
            leadClassName="leading-relaxed text-muted-foreground"
          />
        )}
        <div className="mt-auto flex shrink-0 flex-wrap items-center gap-x-1.5 text-[10px] text-muted-foreground">
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
