"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NewsArticle } from "@/types";
import { timeAgoFa, formatFa } from "@/lib/utils";

const ROTATE_INTERVAL_MS = 30_000;

// Tailwind needs these classes to appear literally in the source (no dynamic
// string building) to pick them up — hence the small fixed lookup tables
// instead of computing the transform/filter classes on the fly.
const STACK_TRANSFORM: Record<number, string> = {
  0: "translate-x-0 translate-y-0 scale-100",
  1: "translate-x-5 translate-y-5 scale-[0.94] sm:translate-x-8 sm:translate-y-8",
  2: "translate-x-10 translate-y-10 scale-[0.88] sm:translate-x-16 sm:translate-y-16",
};
const STACK_LAYER: Record<number, string> = {
  0: "z-30",
  1: "z-20 blur-[2px] brightness-75",
  2: "z-10 blur-[5px] brightness-50",
};

export function HeroNews({ articles }: { articles: NewsArticle[] }) {
  const count = articles.length;
  const [frontIndex, setFrontIndex] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count > 1) {
      timerRef.current = setInterval(() => {
        setFrontIndex((i) => (i + 1) % count);
      }, ROTATE_INTERVAL_MS);
    }
  }, [count]);

  React.useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  if (count === 0) return null;

  function goTo(index: number) {
    setFrontIndex(((index % count) + count) % count);
    resetTimer();
  }

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-border sm:min-h-[480px]">
      {articles.map((article, i) => {
        const stackPos = (i - frontIndex + count) % count; // 0 = front
        return (
          <HeroSlide
            key={article.id}
            article={article}
            stackPos={stackPos > 2 ? 2 : stackPos}
            onBringToFront={stackPos !== 0 ? () => goTo(i) : undefined}
          />
        );
      })}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(frontIndex - 1)}
            aria-label="خبر ویژه قبلی"
            className="absolute top-1/2 right-3 z-40 -translate-y-1/2 rounded-full border border-white/30 bg-navy-900/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-navy-900/80 sm:right-4"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(frontIndex + 1)}
            aria-label="خبر ویژه بعدی"
            className="absolute top-1/2 left-3 z-40 -translate-y-1/2 rounded-full border border-white/30 bg-navy-900/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-navy-900/80 sm:left-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-4">
            {articles.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`نمایش خبر ویژه ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === frontIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function HeroSlide({
  article,
  stackPos,
  onBringToFront,
}: {
  article: NewsArticle;
  stackPos: number;
  onBringToFront?: () => void;
}) {
  const isFront = stackPos === 0;

  const inner = (
    <>
      <Image
        src={article.coverImage.url}
        alt={article.coverImage.alt}
        fill
        priority={isFront}
        sizes="100vw"
        className={`object-cover ${isFront ? "transition-transform duration-500 group-hover:scale-105" : ""}`}
        style={{ objectPosition: article.coverImage.objectPosition || "center" }}
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
    </>
  );

  const sharedClasses = `group absolute inset-0 flex overflow-hidden rounded-xl transition-all duration-700 ease-out ${STACK_TRANSFORM[stackPos]} ${STACK_LAYER[stackPos]}`;

  if (isFront) {
    return (
      <Link href={`/news/${article.slug}`} className={sharedClasses} aria-label={article.title}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onBringToFront}
      aria-label={`نمایش خبر: ${article.title}`}
      className={`${sharedClasses} cursor-pointer text-right`}
    >
      {inner}
    </button>
  );
}
