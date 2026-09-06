"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SocialLinksRow } from "@/components/layout/social-links-row";
import { formatJalaliWithWeekday } from "@/lib/utils";

/**
 * Thin bar above the main header — site's primary blue, always visible.
 * Layout (matters because the site is RTL, so DOM order is flipped
 * visually): social links first in markup render on the physical RIGHT;
 * search + theme toggle last in markup render on the physical LEFT; the
 * date sits centered in between (absolutely centered so it doesn't shift
 * when the search box opens).
 *
 * The search form here is the same one that used to live in the header
 * (same action="/search" GET form, same input name, same open/close
 * behavior) — it just moved here; the header no longer has its own.
 */
export function TopBar() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const today = formatJalaliWithWeekday(new Date());

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-page relative flex h-9 items-center justify-between gap-2">
        <div className="shrink-0">
          <SocialLinksRow compact variant="plain" className="flex items-center gap-3" />
        </div>

        {!searchOpen && (
          <p className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 truncate px-1 text-[11px] font-medium sm:text-xs">
            {today}
          </p>
        )}

        <div className="flex shrink-0 items-center gap-1">
          {searchOpen ? (
            <form role="search" action="/search" className="flex items-center gap-1">
              <Input
                autoFocus
                type="search"
                name="q"
                placeholder="جست‌وجو در مدار مردم…"
                className="h-7 w-36 border-white/30 bg-white/10 text-xs text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-white/50 sm:w-56"
                aria-label="جست‌وجو"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="بستن جست‌وجو"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="جست‌وجو"
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          )}
          <ThemeToggle compact className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}
