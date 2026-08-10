import { getSocialLinks } from "@/lib/social-links";

export function SocialLinksRow({ className }: { className?: string }) {
  const links = getSocialLinks();
  if (links.length === 0) return null;

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
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
            style={{ backgroundColor: link.brandColor }}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
