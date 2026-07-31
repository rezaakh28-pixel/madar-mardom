import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { PulseItem } from "@/types";
import { cn, timeAgoFa, toPersianDigits, formatFa } from "@/lib/utils";

function Sparkline({ values, trend }: { values: number[]; trend: PulseItem["trend"] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 24 - ((v - min) / range) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  const stroke = trend === "up" ? "stroke-rise" : trend === "down" ? "stroke-fall" : "stroke-muted-foreground";

  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-6 w-full" aria-hidden>
      <polyline points={points} fill="none" className={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendIcon({ trend }: { trend: PulseItem["trend"] }) {
  if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5" />;
  if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

function PulseCard({ item }: { item: PulseItem }) {
  const trendColor = item.trend === "up" ? "text-rise" : item.trend === "down" ? "text-fall" : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
        {typeof item.changePercent === "number" && (
          <span className={cn("flex items-center gap-0.5 text-[11px] font-semibold", trendColor)}>
            <TrendIcon trend={item.trend} />
            {formatFa(Math.abs(item.changePercent))}٪
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-base font-extrabold text-foreground sm:text-lg">{toPersianDigits(item.value)}</span>
        {item.unit && <span className="text-xs text-muted-foreground">{item.unit}</span>}
      </div>

      {item.sparkline && <Sparkline values={item.sparkline} trend={item.trend} />}

      <span className="text-[11px] text-muted-foreground">به‌روزرسانی {timeAgoFa(item.updatedAt)}</span>
    </div>
  );
}

export function PulseOfSociety({ items }: { items: PulseItem[] }) {
  return (
    <section aria-labelledby="pulse-heading" className="relative overflow-hidden rounded-xl border border-border bg-navy-50/60 p-5 sm:p-7">
      {/* Signature motif: a slow ECG-style sweep behind the section heading, echoing "نبض" (pulse). */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 overflow-hidden opacity-[0.15]">
        <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="h-full w-[200%] text-primary">
          <polyline
            points="0,30 40,30 55,10 70,50 85,30 400,30"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="animate-pulse-sweep"
            strokeDasharray="1000"
          />
        </svg>
      </div>

      <div className="relative mb-5 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-secondary" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
        </span>
        <h2 id="pulse-heading" className="text-lg font-extrabold text-primary sm:text-xl">
          نبض جامعه
        </h2>
        <span className="text-xs text-muted-foreground">شاخص‌های روزمره زندگی مردم</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <PulseCard key={item.metric} item={item} />
        ))}
      </div>
    </section>
  );
}
