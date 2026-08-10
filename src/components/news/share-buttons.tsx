"use client";

import * as React from "react";
import { Link2, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSocialLinks } from "@/lib/social-links";
import { cn } from "@/lib/utils";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const socialLinks = getSocialLinks();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — no-op; the link is still visible to select manually.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1.5 transition-opacity duration-200", expanded && "pointer-events-none opacity-0")}
          onClick={() => setExpanded(true)}
        >
          <Share2 className="h-3.5 w-3.5" />
          فضای مجازی
        </Button>
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out",
            expanded ? "w-auto opacity-100" : "pointer-events-none w-0 opacity-0"
          )}
        >
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.label}
                aria-label={`کانال مدار مردم در ${link.label}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
                style={{ backgroundColor: link.brandColor }}
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
        <Link2 className="h-3.5 w-3.5" />
        {copied ? "کپی شد" : "کپی لینک"}
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
        <Printer className="h-3.5 w-3.5" />
        نسخه چاپی
      </Button>
    </div>
  );
}
