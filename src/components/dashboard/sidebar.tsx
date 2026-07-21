"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileEdit, Gauge, ShieldCheck, Newspaper } from "lucide-react";
import type { UserRole } from "@/types";
import { hasRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{ href: string; label: string; minimumRole: UserRole; icon: typeof Gauge }> = [
  { href: "/dashboard/reporter", label: "پنل خبرنگار", minimumRole: "REPORTER", icon: FileEdit },
  { href: "/dashboard/editor", label: "پنل سردبیر", minimumRole: "EDITOR", icon: Newspaper },
  { href: "/dashboard/admin", label: "پنل مدیر", minimumRole: "ADMIN", icon: ShieldCheck },
];

export function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <nav aria-label="ناوبری پنل" className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.filter((item) => hasRole(role, item.minimumRole)).map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
