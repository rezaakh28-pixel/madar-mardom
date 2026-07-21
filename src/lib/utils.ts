import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a number using Persian (Farsi) digits and separators. */
export function formatFa(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

/** Formats a Gregorian date as a Persian (Jalali) date string, e.g. "۲۵ تیر ۱۴۰۵". */
export function formatJalali(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** Relative time in Persian, e.g. "۳ ساعت پیش". Falls back to a formatted date beyond 7 days. */
export function timeAgoFa(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat("fa-IR", { numeric: "auto" });

  if (diffMin < 1) return "لحظاتی پیش";
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return rtf.format(-diffHour, "hour");
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return rtf.format(-diffDay, "day");
  return formatJalali(d);
}

export function readingTime(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 180));
}
