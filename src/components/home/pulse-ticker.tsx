"use client";

import * as React from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { PulseItem } from "@/types";
import { cn, toPersianDigits, formatFa } from "@/lib/utils";

const ROTATE_INTERVAL_MS = 3000; // medium speed
const SLOT_COUNT = 6;

function TrendIcon({ trend }: { trend: PulseItem["trend"] }) {
  if (trend === "up") return <ArrowUpRight className="h-3 w-3" />;
  if (trend === "down") return <ArrowDownRight className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
}

function PulseSlot({ item }: { item: PulseItem }) {
  const trendColor = item.trend === "up" ? "text-rise" : item.trend === "down" ? "text-fall" : "text-muted-foreground";

  return (
    <div key={item.metric} className="flex flex-col items-center gap-0.5 px-2 animate-roll-in-down">
      <span className="whitespace-nowrap text-[11px] text-muted-foreground">{item.label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-numeral text-sm font-extrabold text-foreground">{toPersianDigits(item.value)}</span>
        {item.unit && <span className="text-[10px] text-muted-foreground">{item.unit}</span>}
      </div>
      {typeof item.changePercent === "number" && (
        <span className={cn("flex items-center gap-0.5 text-[10px] font-semibold", trendColor)}>
          <TrendIcon trend={item.trend} />
          {formatFa(Math.abs(item.changePercent))}٪
        </span>
      )}
    </div>
  );
}

/**
 * "نبض جامعه" as a thin rotating ticker bar. The title stays fixed on the
 * right; the indicator slots to its left cycle through every item (one step
 * every few seconds, with a roll-down animation) since there are usually
 * more indicators than fit on screen at once.
 */
export function PulseTicker({ items }: { items: PulseItem[] }) {
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    if (items.length <= SLOT_COUNT) return;
    const id = setInterval(() => {
      setOffset((o) => (o + 1) % items.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  const visibleCount = Math.min(SLOT_COUNT, items.length);
  const visible = Array.from({ length: visibleCount }, (_, i) => items[(offset + i) % items.length]!);

  // Hide the tail slots on narrower screens so the bar never wraps to a second line.
  const RESPONSIVE_VISIBILITY = [
    "",
    "",
    "hidden sm:flex",
    "hidden md:flex",
    "hidden lg:flex",
    "hidden xl:flex",
  ];

  return (
    <section
      aria-label="نبض جامعه — شاخص‌های روزمره زندگی مردم"
      className="overflow-hidden rounded-xl border border-border bg-navy-50/60"
    >
      <div className="flex items-center gap-1 px-3 py-2 sm:gap-2 sm:px-4">
        <div className="flex flex-1 items-center justify-evenly overflow-hidden">
          {visible.map((item, i) => (
            <div key={`${offset}-${i}`} className={cn("flex", RESPONSIVE_VISIBILITY[i] ?? "flex")}>
              <PulseSlot item={item} />
            </div>
          ))}
        </div>

        <div className="mr-1 flex shrink-0 items-center gap-1.5 border-r border-border pr-3 sm:mr-2 sm:pr-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-secondary" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
          </span>
          <Activity className="h-3.5 w-3.5 text-primary" />
          <h2 className="whitespace-nowrap text-xs font-bold text-primary sm:text-sm">نبض جامعه</h2>
        </div>
      </div>
    </section>
  );
}
