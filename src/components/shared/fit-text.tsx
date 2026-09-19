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

  React.useLayoutEffect(() => {
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
  }, [children, maxFontSize, minFontSize, maxLines]);

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
