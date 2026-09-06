import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SocialLinksRow } from "@/components/layout/social-links-row";
import { formatJalaliWithWeekday } from "@/lib/utils";

/**
 * Thin bar above the main header — site's primary blue, always visible.
 * Layout (matters because the site is RTL, so DOM order is flipped
 * visually): social links first in markup render on the physical RIGHT;
 * search + theme toggle last in markup render on the physical LEFT; the
 * date sits centered in between.
 */
export function TopBar() {
  const today = formatJalaliWithWeekday(new Date());

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-page grid h-9 grid-cols-3 items-center gap-2">
        <div className="shrink-0 justify-self-start overflow-hidden">
          <SocialLinksRow compact className="flex items-center gap-1.5" />
        </div>

        <p className="justify-self-center truncate text-[11px] font-medium sm:text-xs">{today}</p>

        <div className="flex shrink-0 items-center gap-1 justify-self-end">
          <Link
            href="/search"
            aria-label="جست‌وجو"
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <Search className="h-3.5 w-3.5" />
          </Link>
          <ThemeToggle compact className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}
