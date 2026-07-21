import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NewsArticle } from "@/types";
import { timeAgoFa, formatFa } from "@/lib/utils";

export function HeroNews({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group relative flex min-h-[420px] overflow-hidden rounded-xl border border-border sm:min-h-[480px]"
    >
      <Image
        src={article.coverImage.url}
        alt={article.coverImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/95 via-navy-900/50 to-transparent" />

      <div className="relative mt-auto flex flex-col gap-3 p-6 sm:p-10 sm:pb-8">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{article.category.title}</Badge>
          <span className="text-xs text-white/70">خبر ویژه</span>
        </div>
        <h1 className="max-w-3xl text-balance text-2xl font-extrabold leading-snug text-white sm:text-4xl">
          {article.title}
        </h1>
        <p className="max-w-2xl text-balance text-sm leading-relaxed text-white/80 sm:text-base">
          {article.lead}
        </p>
        <div className="flex items-center gap-3 text-xs text-white/70">
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
    </Link>
  );
}
