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

/** Formats a Gregorian date as a Persian (Jalali) date with the weekday name, e.g. "شنبه، ۲۵ تیر ۱۴۰۵". */
export function formatJalaliWithWeekday(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const weekday = new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(d);
  return `${weekday}، ${formatJalali(d)}`;
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
const VIDEO_LINE_RE = /^\[video\]\((https?:\/\/[^\s")]+)\)$/i;

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? null;
}

function extractAparatHash(url: string): string | null {
  const match = url.match(/aparat\.com\/v\/([A-Za-z0-9]+)/);
  return match?.[1] ?? null;
}

function videoEmbedHtml(url: string): string {
  const youTubeId = extractYouTubeId(url);
  if (youTubeId) {
    return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${escapeAttr(youTubeId)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  const aparatHash = extractAparatHash(url);
  if (aparatHash) {
    return `<div class="video-embed"><iframe src="https://www.aparat.com/video/video/embed/videohash/${escapeAttr(aparatHash)}/vt/frame" allowfullscreen></iframe></div>`;
  }
  return `<div class="video-embed"><video controls src="${escapeAttr(url)}"></video></div>`;
}

/**
 * Converts plain text (as typed into the reporter's/editor's textarea, with
 * blank-line-separated paragraphs) into safe HTML for rendering. Escapes
 * HTML special characters first — article body is real user-submitted
 * content, not trusted mock data, so this must not allow arbitrary
 * markup/script injection via dangerouslySetInnerHTML.
 *
 * A paragraph containing only `![alt](url)` (inserted by the "insert image"
 * button in the reporter's editor) renders as an inline image, and
 * `[video](url)` (inserted by "insert video") renders as an embedded
 * YouTube/Aparat/direct-file player — see components/dashboard/article-form.tsx.
 * Only http(s) and site-relative URLs are allowed.
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
      const videoMatch = paragraph.match(VIDEO_LINE_RE);
      if (videoMatch) {
        return videoEmbedHtml(videoMatch[1]!);
      }
      return `<p>${paragraph.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}
