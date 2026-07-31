import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a number using Persian (Farsi) digits and separators. */
/** Converts any Latin digits (0-9) inside a string to Persian digits (۰-۹), leaving everything else untouched. */
export function toPersianDigits(text: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return text.replace(/[0-9]/g, (digit) => persianDigits[Number(digit)]!);
}

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

const IMAGE_LINE_RE = /^!\[([^\]]*)\]\((https?:\/\/[^\s")]+|\/[^\s")]+)\)$/;

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/**
 * Converts plain text (as typed into the reporter's/editor's textarea, with
 * blank-line-separated paragraphs) into safe HTML for rendering. Escapes
 * HTML special characters first — article body is real user-submitted
 * content, not trusted mock data, so this must not allow arbitrary
 * markup/script injection via dangerouslySetInnerHTML.
 *
 * A paragraph containing only `![alt](url)` (inserted by the "insert image"
 * button in the reporter's editor — see components/dashboard/article-form.tsx)
 * renders as an inline image instead of a text paragraph. Only http(s) and
 * site-relative URLs are allowed.
 */
export function textToSafeHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const imageMatch = paragraph.match(IMAGE_LINE_RE);
      if (imageMatch) {
        const [, alt, url] = imageMatch;
        return `<img src="${escapeAttr(url!)}" alt="${escapeAttr(alt ?? "")}" loading="lazy" class="w-full rounded-lg" />`;
      }
      return `<p>${paragraph.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}
