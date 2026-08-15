"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import type { MediaAsset } from "@/types";

export function PhotoGallery({ images }: { images: MediaAsset[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const close = React.useCallback(() => setOpenIndex(null), []);
  const prev = React.useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const next = React.useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );

  React.useEffect(() => {
    if (openIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") prev();
      if (e.key === "ArrowLeft") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, close, prev, next]);

  if (images.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {images.map((image, i) => (
          <button
            key={`${image.url}-${i}`}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`نمایش بزرگ‌شده تصویر ${i + 1}`}
            className="group relative aspect-square overflow-hidden rounded-md border border-border"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="نمایش تمام‌صفحه تصویر"
          onClick={close}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="بستن"
            className="absolute left-4 top-4 z-10 rounded-full border border-white/30 bg-navy-900/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-navy-900/80"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="تصویر قبلی"
            className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-navy-900/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-navy-900/80 sm:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="تصویر بعدی"
            className="absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-navy-900/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-navy-900/80 sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div className="relative h-full max-h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[openIndex]!.url}
              alt={images[openIndex]!.alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-numeral text-xs text-white/70">
            {openIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
}
