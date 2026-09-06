import { getSocialLinks } from "@/lib/social-links";

export function SocialLinksRow({ className, compact = false }: { className?: string; compact?: boolean }) {
  const links = getSocialLinks();
  if (links.length === 0) return null;

  const circleSize = compact ? "h-6 w-6" : "h-9 w-9";
  const iconSize = compact ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className={className}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`کانال مدار مردم در ${link.label}`}
            title={link.label}
            className={`flex ${circleSize} items-center justify-center rounded-full text-white transition-transform hover:scale-110`}
            style={{ backgroundColor: link.brandColor }}
          >
            <Icon className={iconSize} />
          </a>
        );
      })}
    </div>
  );
}
