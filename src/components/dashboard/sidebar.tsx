"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileEdit,
  ShieldCheck,
  Newspaper,
  FileStack,
  Megaphone,
  Star,
  FolderOpen,
  Users,
  UserCog,
  Mail,
  BarChart3,
  Activity,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";
import { hasRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const TOP_NAV: Array<NavItem & { minimumRole: UserRole; section: string }> = [
  { href: "/dashboard/reporter", label: "پنل خبرنگار", minimumRole: "REPORTER", icon: FileEdit, section: "reporter" },
  { href: "/dashboard/editor", label: "پنل سردبیر", minimumRole: "EDITOR", icon: Newspaper, section: "editor" },
  { href: "/dashboard/admin", label: "پنل مدیر", minimumRole: "ADMIN", icon: ShieldCheck, section: "admin" },
];

const REPORTER_SUB_NAV: NavItem[] = [
  { href: "/dashboard/reporter", label: "نوشتن خبر", icon: FileEdit },
  { href: "/dashboard/reporter/drafts", label: "پیش‌نویس‌های من", icon: FileStack },
];

const EDITOR_SUB_NAV: NavItem[] = [
  { href: "/dashboard/editor", label: "تأیید اخبار", icon: Newspaper },
  { href: "/dashboard/editor/voice", label: "صدای مردم", icon: Megaphone },
  { href: "/dashboard/editor/featured", label: "خبر ویژه", icon: Star },
  { href: "/dashboard/editor/special-cases", label: "پرونده‌های ویژه", icon: FolderOpen },
  { href: "/dashboard/editor/articles", label: "همه اخبار", icon: Newspaper },
];

const ADMIN_SUB_NAV: NavItem[] = [
  { href: "/dashboard/admin", label: "آمار سایت", icon: BarChart3 },
  { href: "/dashboard/admin/voice", label: "صدای مردم", icon: Megaphone },
  { href: "/dashboard/admin/featured", label: "خبر ویژه", icon: Star },
  { href: "/dashboard/admin/special-cases", label: "پرونده‌های ویژه", icon: FolderOpen },
  { href: "/dashboard/admin/articles", label: "همه اخبار", icon: Newspaper },
  { href: "/dashboard/admin/reporters", label: "خبرنگاران", icon: Users },
  { href: "/dashboard/admin/editors", label: "سردبیران", icon: UserCog },
  { href: "/dashboard/admin/contact", label: "تماس با ما", icon: Mail },
  { href: "/dashboard/admin/pulse", label: "نبض جامعه", icon: Activity },
];

export function DashboardSidebar({
  role,
  beatCategorySlugs,
}: {
  role: UserRole;
  beatCategorySlugs?: string[];
}) {
  const pathname = usePathname();

  const section = pathname.startsWith("/dashboard/admin")
    ? "admin"
    : pathname.startsWith("/dashboard/editor")
      ? "editor"
      : "reporter";

  let subNav = section === "admin" ? ADMIN_SUB_NAV : section === "editor" ? EDITOR_SUB_NAV : REPORTER_SUB_NAV;

  if (section === "editor" && beatCategorySlugs?.includes("economy")) {
    subNav = [...subNav, { href: "/dashboard/editor/pulse", label: "نبض جامعه", icon: Activity }];
  }

  return (
    <nav aria-label="ناوبری پنل" className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-1">
        {TOP_NAV.filter((item) => hasRole(role, item.minimumRole)).map((item) => {
          const Icon = item.icon;
          const active = section === item.section;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-bold transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 border-t border-border pt-3">
        {subNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-accent font-medium text-primary" : "text-foreground/70 hover:bg-accent"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
