import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NewsArticle } from "@/types";
import { timeAgoFa, formatFa } from "@/lib/utils";

/**
 * The single big "تیتر اصلی" headline — cover image full-bleed behind the
 * card, with a gradient darkening from the middle toward the right so the
 * image stays visible on the left while the title/lead (physically anchored
 * right, via `ml-auto` — a guaranteed-physical utility regardless of the
 * site's RTL direction) stays legible.
 */
export function HeroHeadline({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group relative block min-h-[360px] overflow-hidden rounded-xl border border-border sm:min-h-[440px]"
    >
      <Image
        src={article.coverImage.url}
        alt={article.coverImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ objectPosition: article.coverImage.objectPosition || "center" }}
      />

      {/* Fades from clear (left, image visible) through the middle to solid navy (right, where the text sits). */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-navy-900/70 to-navy-900" />
      {/* Extra bottom gradient so the meta row stays legible on any image. */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent" />

      <div className="relative flex h-full min-h-[360px] flex-col justify-end p-6 sm:min-h-[440px] sm:p-10">
        <div className="ml-auto max-w-xl text-right">
          <Badge variant="secondary">{article.category.title}</Badge>
          <h1 className="mt-3 text-balance text-2xl font-extrabold leading-snug text-white sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 line-clamp-2 text-balance text-sm leading-relaxed text-white/80 sm:text-base">
            {article.lead}
          </p>
          <div className="mt-4 flex items-center justify-end gap-3 text-xs text-white/70">
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
      </div>
    </Link>
  );
}
