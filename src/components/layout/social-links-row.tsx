import { getSocialLinks } from "@/lib/social-links";

export function SocialLinksRow({
  className,
  compact = false,
  variant = "colored",
}: {
  className?: string;
  compact?: boolean;
  /** "colored" — each icon on its own brand-color circle (footer). "plain" — bare white icons, no circle (thin top bar). */
  variant?: "colored" | "plain";
}) {
  const links = getSocialLinks();
  if (links.length === 0) return null;

  const iconSize = compact ? "h-3.5 w-3.5" : "h-4 w-4";
  const circleSize = compact ? "h-6 w-6" : "h-9 w-9";

  return (
    <div className={className}>
      {links.map((link) => {
        const Icon = link.icon;

        if (variant === "plain") {
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`کانال مدار مردم در ${link.label}`}
              title={link.label}
              className="flex items-center justify-center text-white transition-opacity hover:opacity-75"
            >
              <Icon className={iconSize} />
            </a>
          );
        }

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
