"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, User, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const PRIMARY_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/news", label: "اخبار" },
  { href: "/society", label: "جامعه" },
  { href: "/economy", label: "اقتصاد" },
  { href: "/politics", label: "سیاست" },
  { href: "/world", label: "جهان" },
  { href: "/voice", label: "صدای مردم" },
];

const MORE_LINKS = [
  { href: "/provinces", label: "استان‌ها" },
  { href: "/analysis", label: "تحلیل" },
  { href: "/notes", label: "یادداشت" },
  { href: "/reports", label: "گزارش" },
  { href: "/special-cases", label: "پرونده‌های ویژه" },
  { href: "/data", label: "داده" },
  { href: "/video", label: "ویدیو" },
  { href: "/podcast", label: "پادکست" },
  { href: "/infographic", label: "اینفوگرافیک" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="مدار مردم — صفحه اصلی">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            م
          </span>
          <span className="hidden flex-col sm:flex">
            <span className="text-lg font-extrabold leading-tight text-primary">مدار مردم</span>
            <span className="text-[11px] leading-none text-muted-foreground">خبر از دل جامعه</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="ناوبری اصلی" className="hidden items-center gap-0.5 lg:flex">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === link.href && "bg-accent text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium text-foreground/80">
                بیشتر
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {MORE_LINKS.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <div className="hidden items-center sm:flex">
            {searchOpen ? (
              <form
                role="search"
                className="flex items-center gap-1"
                onSubmit={(e) => e.preventDefault()}
              >
                <Input
                  autoFocus
                  type="search"
                  placeholder="جست‌وجو در مدار مردم…"
                  className="h-9 w-56"
                  aria-label="جست‌وجو"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)} aria-label="بستن جست‌وجو">
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" aria-label="جست‌وجو" onClick={() => setSearchOpen(true)}>
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          <ThemeToggle />

          <Button variant="secondary" size="sm" className="hidden gap-1.5 sm:inline-flex">
            <User className="h-4 w-4" />
            ورود
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            <form role="search" className="mb-2 flex items-center gap-1" onSubmit={(e) => e.preventDefault()}>
              <Input type="search" placeholder="جست‌وجو در مدار مردم…" aria-label="جست‌وجو" />
            </form>
            {[...PRIMARY_LINKS, ...MORE_LINKS].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium text-foreground/85 hover:bg-accent",
                  pathname === link.href && "bg-accent text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button variant="secondary" size="sm" className="mt-2 gap-1.5">
              <User className="h-4 w-4" />
              ورود
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
