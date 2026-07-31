import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS_FA } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { getCategoryBySlug } from "@/lib/mock-data";
import { logoutAction } from "@/app/login/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const beatCategories = (session.user.beatCategorySlugs ?? [])
    .map((slug) => getCategoryBySlug(slug)?.title)
    .filter((title): title is string => Boolean(title));

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <Link href="/" className="text-sm font-extrabold text-primary">
          مدار مردم <span className="font-normal text-muted-foreground">— پنل داخلی</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {session.user.name} · {ROLE_LABELS_FA[session.user.role]}
            {beatCategories.length > 0 && ` · ${beatCategories.join("، ")}`}
          </span>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="icon" aria-label="خروج">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-e border-border bg-background sm:block">
          <DashboardSidebar role={session.user.role} beatCategorySlugs={session.user.beatCategorySlugs} />
        </aside>
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
