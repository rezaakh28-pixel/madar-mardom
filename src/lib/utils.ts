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

/** Formats a Gregorian date's time as HH:mm in Persian digits, e.g. "۱۴:۰۵". */
export function formatTimeFa(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
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
const ALIGN_BLOCK_RE = /^\[align=(right|center|left)\]\n([\s\S]*)\n\[\/align\]$/;
const COLOR_RE = /\{color:(#[0-9a-fA-F]{3,8})\}([\s\S]*?)\{\/color\}/g;
const SIZE_RE = /\{size:(\d{1,3})\}([\s\S]*?)\{\/size\}/g;
const BOLD_RE = /\*\*([^\n]+?)\*\*/g;
const ITALIC_RE = /\*([^\n*]+?)\*/g;
const UNDERLINE_RE = /\+\+([^\n]+?)\+\+/g;

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? null;
}

/**
 * A YouTube thumbnail URL for a given video URL, or null if it isn't a
 * recognizable YouTube link. Used as an automatic cover-image fallback for
 * "ویدیو"-category articles, which skip the manual cover-image upload —
 * contexts that need a plain static image (small list cards, search/tag
 * pages, social preview tags) fall back to this instead of the video player.
 */
export function youTubeThumbnailUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
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
 * Renders the reporter's inline-formatting syntax (inserted by the body
 * toolbar's bold/italic/underline/color/size buttons — see
 * components/dashboard/article-form.tsx) into real HTML. Runs on already
 * HTML-escaped text, so this only ever wraps existing escaped text in a
 * handful of safe, fixed tags/inline styles — it can't introduce markup of
 * its own. Colors/sizes are constrained by their regexes (a leading `#` plus
 * hex digits; 1–3 plain digits) so there's nothing to sanitize further.
 */
function applyInlineFormatting(text: string): string {
  return text
    .replace(COLOR_RE, (_m, color: string, inner: string) => `<span style="color:${color}">${inner}</span>`)
    .replace(SIZE_RE, (_m, size: string, inner: string) => `<span style="font-size:${size}px">${inner}</span>`)
    .replace(BOLD_RE, (_m, inner: string) => `<strong>${inner}</strong>`)
    .replace(ITALIC_RE, (_m, inner: string) => `<em>${inner}</em>`)
    .replace(UNDERLINE_RE, (_m, inner: string) => `<u>${inner}</u>`);
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
 *
 * A paragraph wrapped in `[align=right|center|left] ... [/align]` (inserted
 * by the alignment toolbar buttons) renders as that one paragraph with the
 * matching text-align. Within any paragraph, `**bold**`, `*italic*`,
 * `++underline++`, `{color:#hex}...{/color}`, and `{size:N}...{/size}`
 * (inserted by the corresponding toolbar buttons) render as their matching
 * inline styling.
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
      const alignMatch = paragraph.match(ALIGN_BLOCK_RE);
      if (alignMatch) {
        const [, align, inner] = alignMatch;
        const formatted = applyInlineFormatting(inner!).replace(/\n/g, "<br />");
        return `<p style="text-align:${align}">${formatted}</p>`;
      }
      const formatted = applyInlineFormatting(paragraph).replace(/\n/g, "<br />");
      return `<p>${formatted}</p>`;
    })
    .join("");
}

/**
 * Wraps the selected range [start, end) of `text` with `prefix`/`suffix` —
 * or, if nothing is selected, inserts an empty pair with the cursor left in
 * between. Used by the body toolbar's bold/italic/underline/color/size
 * buttons. Returns where the textarea's selection should move to afterward,
 * so the *original* selected text stays selected (now inside the new
 * wrapper) and a second formatting click nests correctly instead of
 * re-selecting the markers themselves.
 */
export function wrapSelection(
  text: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string
): { text: string; selectionStart: number; selectionEnd: number } {
  const before = text.slice(0, start);
  const selected = text.slice(start, end);
  const after = text.slice(end);
  return {
    text: `${before}${prefix}${selected}${suffix}${after}`,
    selectionStart: start + prefix.length,
    selectionEnd: start + prefix.length + selected.length,
  };
}

/**
 * Wraps the paragraph the cursor currently sits in (bounded by blank lines)
 * with an `[align=...]` block, replacing any alignment already on that same
 * paragraph rather than nesting. Used by the toolbar's align-right/center/
 * left buttons. A click with no paragraph under the cursor (blank line) is
 * a no-op.
 */
export function setParagraphAlign(
  text: string,
  cursorPos: number,
  align: "right" | "center" | "left"
): { text: string; selectionStart: number; selectionEnd: number } {
  const before = text.slice(0, cursorPos);
  const after = text.slice(cursorPos);
  const startBoundaryRel = before.lastIndexOf("\n\n");
  const endBoundaryRel = after.indexOf("\n\n");
  const paraStart = startBoundaryRel === -1 ? 0 : startBoundaryRel + 2;
  const paraEnd = endBoundaryRel === -1 ? text.length : cursorPos + endBoundaryRel;

  let paragraph = text.slice(paraStart, paraEnd);
  const existing = paragraph.match(ALIGN_BLOCK_RE);
  if (existing) paragraph = existing[2]!;

  if (!paragraph.trim()) {
    return { text, selectionStart: cursorPos, selectionEnd: cursorPos };
  }

  const wrapped = `[align=${align}]\n${paragraph}\n[/align]`;
  const newCursor = paraStart + wrapped.length;
  return {
    text: text.slice(0, paraStart) + wrapped + text.slice(paraEnd),
    selectionStart: newCursor,
    selectionEnd: newCursor,
  };
}
