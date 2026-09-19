import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VideoEmbedFill } from "@/components/news/video-embed";
import { TitleLeadFit } from "@/components/shared/title-lead-fit";
import type { NewsArticle } from "@/types";
import { timeAgoFa, formatFa } from "@/lib/utils";

/**
 * The single big "تیتر اصلی" headline — a true 16:9 cover image on the
 * physical left, and the site's blue (bg-primary, theme-aware) filling the
 * physical right with the title/lead/meta. A gradient at the seam between
 * them blends the photo into the blue instead of a hard edge.
 *
 * Fixed, non-growing box: the image is always a real 16:9 box (self-start,
 * so CSS Grid's default row-stretch can't distort it to match the text
 * panel), and the title/lead use TitleLeadFit (components/shared/title-lead-
 * fit.tsx) to shrink to fit within 2 lines each — the lead's size always
 * trails the title's resolved size — instead of ever pushing the box taller
 * or getting cut off.
 *
 * DOM order: text panel first, then image — on this RTL site the first grid
 * item sits physically on the right by default, so no extra ordering is
 * needed on larger screens. On mobile the two stack, with the image on top
 * (order-1) and the text panel below (order-2).
 */
export function HeroHeadline({ article }: { article: NewsArticle }) {
  const isPlayableVideo = !!article.videoUrl;

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group grid grid-cols-1 overflow-hidden rounded-xl border border-border sm:grid-cols-2"
    >
      {/* Text panel — site blue, physically on the right on sm+. */}
      <div className="order-2 flex flex-col justify-center gap-3 bg-primary p-6 text-primary-foreground sm:order-1 sm:p-10">
        <Badge variant="secondary" className="w-fit">
          {article.category.title}
        </Badge>
        <TitleLeadFit
          title={article.title}
          lead={article.lead}
          titleAs="h1"
          titleMaxLines={2}
          titleMaxFontSize={30}
          titleMinFontSize={18}
          titleClassName="text-balance font-extrabold leading-snug"
          leadMaxLines={2}
          leadOffset={12}
          leadMinFontSize={13}
          leadClassName="text-balance leading-relaxed opacity-80"
        />
        <div className="flex items-center gap-3 text-xs opacity-70">
          <span>{article.author.name}</span>
          <span aria-hidden>·</span>
          <span>{timeAgoFa(article.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatFa(article.readingMinutes)} دقیقه مطالعه
          </span>
        </div>
      </div>

      {/* Image/video — always a true 16:9 box, physically on the left on sm+. */}
      <div className="relative order-1 aspect-[16/9] w-full self-start overflow-hidden sm:order-2">
        {isPlayableVideo ? (
          <VideoEmbedFill url={article.videoUrl!} title={article.title} />
        ) : (
          <Image
            src={article.coverImage.url}
            alt={article.coverImage.alt}
            fill
            priority
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ objectPosition: article.coverImage.objectPosition || "center" }}
          />
        )}
        {/* Blends the photo/video into the blue panel at the seam where they meet. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-r from-transparent to-primary" />
      </div>
    </Link>
  );
}
