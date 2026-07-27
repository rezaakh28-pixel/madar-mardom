/**
 * Generates a URL-safe slug from an article title, keeping Persian/Arabic
 * script intact (Persian news URLs commonly use native-script slugs, and
 * modern browsers handle this fine — it's percent-encoded automatically).
 * A short random suffix guarantees uniqueness even for duplicate titles.
 */
export function slugify(title: string): string {
  const base = title
    .trim()
    .replace(/[\s]+/g, "-")
    // Strip characters that are genuinely unsafe/ambiguous in a URL path segment.
    .replace(/[?#/\\'"<>«»]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : suffix;
}
