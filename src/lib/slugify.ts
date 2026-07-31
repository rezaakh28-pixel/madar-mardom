/**
 * Generates a URL slug for a new article.
 *
 * Deliberately ASCII-only: an earlier version kept Persian script in the
 * slug, which caused intermittent 404s in production — non-ASCII path
 * segments depend on every layer (browser, Vercel's edge network, any
 * redirects) encoding/decoding them identically, and that's not reliable
 * enough to bet page availability on. A short, opaque, fully-ASCII id has
 * zero encoding risk and is a completely standard, common pattern for news
 * sites (e.g. `/news/m8x7k2a1b2c3`).
 */
export function slugify(_title: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}${random}`;
}
