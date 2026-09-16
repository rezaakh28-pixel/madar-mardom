export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function extractAparatHash(url: string): string | null {
  const match = url.match(/aparat\.com\/v\/([A-Za-z0-9]+)/);
  return match?.[1] ?? null;
}

/** Fixed 16:9 box — used on the article detail page, as the main video player. */
export function VideoEmbed({ url, title }: { url: string; title?: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-navy-900">
      <VideoEmbedFill url={url} title={title} />
    </div>
  );
}

/**
 * Same player, but fills whatever sized/positioned container it's placed
 * in (like `<Image fill />` does) instead of forcing its own 16:9 box.
 * Used inside ArticleCard/HeroHeadline so a video article's own image slot
 * — whatever size that card gives it — becomes a real, playable player.
 */
export function VideoEmbedFill({ url, title }: { url: string; title?: string }) {
  const youTubeId = extractYouTubeId(url);
  if (youTubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youTubeId}`}
        title={title ?? "ویدیو"}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  const aparatHash = extractAparatHash(url);
  if (aparatHash) {
    return (
      <iframe
        src={`https://www.aparat.com/video/video/embed/videohash/${aparatHash}/vt/frame`}
        title={title ?? "ویدیو"}
        className="absolute inset-0 h-full w-full"
        allowFullScreen
      />
    );
  }

  // Fallback: treat it as a direct video file URL.
  return (
    <video controls className="absolute inset-0 h-full w-full bg-black object-contain" src={url}>
      مرورگر شما از پخش این ویدیو پشتیبانی نمی‌کند.
    </video>
  );
}
