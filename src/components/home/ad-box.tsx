import type { AdBanner } from "@/lib/ads";

export function AdBox({ ads }: { ads: AdBanner[] }) {
  if (ads.length === 0) return null;

  return (
    <section aria-labelledby="ads-heading" className="rounded-xl border border-border bg-card p-5">
      <h2 id="ads-heading" className="mb-4 text-lg font-extrabold text-foreground">
        تبلیغات
      </h2>
      <div className="flex flex-col gap-4">
        {ads.map((ad) => (
          <a
            key={ad.id}
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            aria-label={ad.title}
            className="group block overflow-hidden rounded-lg border border-border"
          >
            {/* Ad creatives come in arbitrary sizes/aspect ratios, so this
                renders at natural height (no next/image `fill` cropping). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="h-auto w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
