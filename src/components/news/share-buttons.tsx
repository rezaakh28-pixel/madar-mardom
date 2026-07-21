"use client";

import * as React from "react";
import { Link2, Printer, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — no-op; the link is still visible to select manually.
    }
  }

  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <a href={telegramHref} target="_blank" rel="noopener noreferrer" className="gap-1.5">
          <Send className="h-3.5 w-3.5" />
          تلگرام
        </a>
      </Button>
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
