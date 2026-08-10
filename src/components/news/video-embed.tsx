function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractAparatHash(url: string): string | null {
  const match = url.match(/aparat\.com\/v\/([A-Za-z0-9]+)/);
  return match?.[1] ?? null;
}

export function VideoEmbed({ url, title }: { url: string; title?: string }) {
  const youTubeId = extractYouTubeId(url);
  if (youTubeId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-navy-900">
        <iframe
          src={`https://www.youtube.com/embed/${youTubeId}`}
          title={title ?? "ویدیو"}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const aparatHash = extractAparatHash(url);
  if (aparatHash) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-navy-900">
        <iframe
          src={`https://www.aparat.com/video/video/embed/videohash/${aparatHash}/vt/frame`}
          title={title ?? "ویدیو"}
          className="h-full w-full"
          allowFullScreen
        />
      </div>
    );
  }

  // Fallback: treat it as a direct video file URL.
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-navy-900">
      <video controls className="h-full w-full" src={url}>
        مرورگر شما از پخش این ویدیو پشتیبانی نمی‌کند.
      </video>
    </div>
  );
}
