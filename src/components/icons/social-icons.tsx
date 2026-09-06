import type { SVGProps } from "react";

/**
 * Real platform glyphs (not generic lucide stand-ins) for the social links
 * row — used both in the top bar and the footer, via src/lib/social-links.ts.
 * Each renders as a plain silhouette (fill="currentColor") so it picks up
 * whatever text color its wrapper sets (white, on each platform's brand-color
 * circle in social-links-row.tsx / share-buttons.tsx).
 *
 * Telegram and Instagram use their well-known, widely-reused standard glyphs.
 * Eitaa and Bale are Iranian apps without a standard open icon set entry, so
 * these are close, clearly-distinct representative marks (paper-plane /
 * chat-bubble motifs in each platform's real brand color) rather than a
 * pixel-exact trace of the current app icon.
 */

export function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.05 3.94a1.85 1.85 0 0 0-1.88-.29L2.63 10.62a1.5 1.5 0 0 0 .07 2.8l4.9 1.6 1.9 6.1a1.2 1.2 0 0 0 2.09.4l2.68-3.08 5.02 3.7a1.5 1.5 0 0 0 2.36-.88l3.32-15.6a1.85 1.85 0 0 0-.92-1.72ZM9.9 15.4l-1.1-3.7 10.2-6.4-9 7.1v3Z" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0Zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.898 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.898-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06ZM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.846-10.405a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
    </svg>
  );
}

export function EitaaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.4 3.7a1.4 1.4 0 0 0-1.42-.2L2.9 9.9a1.15 1.15 0 0 0 .05 2.14l3.9 1.28 1.53 4.9a1 1 0 0 0 1.72.34l1.9-2.2 3.66 2.7a1.15 1.15 0 0 0 1.81-.67l2.75-13.16a1.4 1.4 0 0 0-.7-1.53ZM9.5 13.5l-.85-2.7 7.9-5.1-7.05 5.9v1.9Z" />
    </svg>
  );
}

export function BaleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.77 1.46 5.24 3.75 6.87-.13 1.13-.5 2.44-1.4 3.63a.5.5 0 0 0 .53.78c1.83-.5 3.35-1.35 4.42-2.1.86.2 1.76.32 2.7.32 5.52 0 10-3.94 10-8.8S17.52 2 12 2Zm-.15 12.1L8.9 11.2l1.1-1.05 1.85 1.75 4.15-4 1.1 1.05Z" />
    </svg>
  );
}
