import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NewsArticle } from "@/types";
import { timeAgoFa, formatFa } from "@/lib/utils";

/**
 * The single big "تیتر اصلی" headline — a proper 16:9 cover image on the
 * physical left, and the site's blue (bg-primary, theme-aware) filling the
 * physical right with the title/lead/meta. A gradient at the seam between
 * them blends the photo into the blue instead of a hard edge.
 *
 * DOM order: text panel first, then image — on this RTL site the first grid
 * item sits physically on the right by default, so no extra ordering is
 * needed on larger screens. On mobile the two stack, with the image on top
 * (order-1) and the text panel below (order-2).
 */
export function HeroHeadline({ article }: { article: NewsArticle }) {
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
        <h1 className="text-balance text-2xl font-extrabold leading-snug sm:text-4xl">
          {article.title}
        </h1>
        <p className="line-clamp-2 text-balance text-sm leading-relaxed opacity-80 sm:text-base">
          {article.lead}
        </p>
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

      {/* Image — proper 16:9 box, physically on the left on sm+. */}
      <div className="relative order-1 aspect-[16/9] w-full overflow-hidden sm:order-2">
        <Image
          src={article.coverImage.url}
          alt={article.coverImage.alt}
          fill
          priority
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition: article.coverImage.objectPosition || "center" }}
        />
        {/* Blends the photo into the blue panel at the seam where they meet. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-r from-transparent to-primary" />
      </div>
    </Link>
  );
}
