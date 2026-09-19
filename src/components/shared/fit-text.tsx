"use client";

import * as React from "react";

/**
 * Renders text clamped to `maxLines`, shrinking its own font-size (in 1px
 * steps, starting from `maxFontSize`) until the text fits within those
 * lines without needing to truncate — falling back to ellipsis only once it
 * hits `minFontSize` and still doesn't fit. Used wherever a card/box has a
 * fixed, non-growing size (see ArticleCard's "large"/"horizontal" cards and
 * HeroHeadline) so a long title shrinks to fit instead of the box growing,
 * getting cropped, or silently rendering blank.
 *
 * Measures itself again once the site's webfont (Vazirmatn, loaded via
 * next/font — see src/app/layout.tsx) is confirmed loaded, and on viewport
 * resize. Without this, the very first measurement can run against the
 * fallback system font's metrics (whichever font that is varies by device/
 * OS) before Vazirmatn swaps in — on a slow connection that measurement
 * locks in before the real font arrives, and Persian glyphs are wide/narrow
 * enough versus common fallbacks that the result visibly differs machine to
 * machine. Re-measuring once fonts.ready resolves fixes that.
 */
export function FitText({
  as: Tag = "span",
  maxLines,
  maxFontSize,
  minFontSize = 10,
  className,
  children,
}: {
  as?: React.ElementType;
  maxLines: number;
  maxFontSize: number;
  minFontSize?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const [fontSize, setFontSize] = React.useState(maxFontSize);

  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    let size = maxFontSize;
    el.style.fontSize = `${size}px`;
    // scrollHeight > clientHeight means the -webkit-line-clamp below is
    // actively truncating (ellipsis) at this size — shrink and check again.
    while (size > minFontSize && el.scrollHeight > el.clientHeight + 1) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
    setFontSize(size);
  }, [maxFontSize, minFontSize]);

  React.useLayoutEffect(() => {
    measure();

    // Re-measure once the real webfont is loaded (see comment above), and
    // again if the viewport is resized (available width changes what fits).
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });

    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
  }, [measure, children, maxLines]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        fontSize,
        display: "-webkit-box",
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {children}
    </Tag>
  );
}
