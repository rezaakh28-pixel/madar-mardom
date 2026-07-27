import type { NewsArticle } from "@/types";
import { db } from "@/lib/db";
import { getRelatedArticles } from "@/lib/content";

// ---------------------------------------------------------------------------
// AI abstraction layer for مدار مردم.
//
// Every function below is a typed stub with a believable mock implementation
// so UI can be built and demoed today. Swap the body of each function for a
// real call (e.g. to the Anthropic API) later — the signatures are the
// contract the rest of the app relies on, so callers won't need to change.
//
// Suggested real implementation: call POST /v1/messages with a system prompt
// tailored to each task (summarizer, title-writer, tagger, etc.) and parse a
// structured JSON response. Keep these functions server-only (do not expose
// API keys to the client).
// ---------------------------------------------------------------------------

function fakeLatency(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Produces a short 2-3 sentence summary of an article body. */
export async function summarizeArticle(body: string): Promise<string> {
  await fakeLatency();
  const plain = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = plain.split(" ").filter(Boolean);
  const short = words.slice(0, 40).join(" ");
  return short.length > 0 ? `${short}…` : "خلاصه‌ای برای این متن یافت نشد.";
}

/** Suggests a headline (تیتر) based on the article body. */
export async function suggestTitle(body: string): Promise<string> {
  await fakeLatency();
  const plain = body.replace(/<[^>]+>/g, " ").trim();
  const firstSentence = plain.split(/[.!؟]/)[0]?.trim() ?? "";
  return firstSentence.length > 8 ? firstSentence : "تیتر پیشنهادی برای این خبر";
}

/** Suggests 3-6 relevant tags for an article body. */
export async function suggestTags(body: string): Promise<string[]> {
  await fakeLatency();
  const stopwords = new Set(["از", "به", "با", "در", "را", "که", "این", "آن", "و", "است"]);
  const plain = body.replace(/<[^>]+>/g, " ");
  const words = plain
    .split(/\s+/)
    .map((w) => w.replace(/[^\u0600-\u06FFa-zA-Z]/g, ""))
    .filter((w) => w.length > 2 && !stopwords.has(w));

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
}

/** Checks whether a similar article already exists (naive similarity check for the stub). */
export async function detectDuplicate(body: string): Promise<boolean> {
  await fakeLatency();
  const normalized = body.replace(/<[^>]+>/g, " ").trim().toLowerCase();
  if (normalized.length === 0) return false;

  let candidates: Array<{ body: string }> = [];
  try {
    candidates = await db.article.findMany({
      select: { body: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch {
    return false; // No database connected yet — nothing to compare against.
  }

  return candidates.some((a) => {
    const existing = a.body.replace(/<[^>]+>/g, " ").trim().toLowerCase();
    if (existing.length === 0) return false;
    const shorter = Math.min(existing.length, normalized.length);
    const longer = Math.max(existing.length, normalized.length);
    return shorter / longer > 0.85 && existing.slice(0, 50) === normalized.slice(0, 50);
  });
}

/** Suggests the most likely category slug for an article body. */
export async function suggestCategory(body: string): Promise<string> {
  await fakeLatency();
  const rules: Array<[RegExp, string]> = [
    [/دلار|تورم|بازار|اقتصاد|قیمت/, "economy"],
    [/انتخابات|مجلس|دولت|سیاست/, "politics"],
    [/آلودگی|مدرسه|شهر|جامعه/, "society"],
    [/آب|روستا|استان/, "provinces"],
    [/جهان|بین‌الملل/, "world"],
  ];
  for (const [pattern, slug] of rules) {
    if (pattern.test(body)) return slug;
  }
  return "society";
}

/** Generates SEO title/description/keywords for an article. */
export async function generateSeoMetadata(
  article: NewsArticle
): Promise<{ title: string; description: string; keywords: string[] }> {
  await fakeLatency();
  return {
    title: article.seo?.title ?? `${article.title} | مدار مردم`,
    description: article.seo?.description ?? article.lead.slice(0, 155),
    keywords: article.seo?.keywords ?? article.tags,
  };
}

/**
 * Converts article text to speech and returns a URL to the generated audio.
 * Stub returns a placeholder URL; wire this to a real TTS provider later.
 */
export async function convertTextToSpeech(body: string): Promise<string> {
  await fakeLatency(800);
  const hash = Math.abs(
    body.split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 100000, 7)
  );
  return `/generated-audio/tts-${hash}.mp3`;
}

/** Suggests related articles for a given article (same category, excluding itself — see src/lib/content.ts). */
export async function suggestRelatedArticles(article: NewsArticle): Promise<NewsArticle[]> {
  await fakeLatency();
  try {
    return await getRelatedArticles(article, 3);
  } catch {
    return [];
  }
}
