import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { UserActivityView } from "@/components/dashboard/user-activity-view";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { getUserActivity } from "@/lib/content";
import { reporterCodename } from "@/lib/codename";
import { getCategoryBySlug } from "@/lib/mock-data";
import { formatJalali } from "@/lib/utils";

export default async function EditorActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const editor = await db.user.findUnique({ where: { id } });
  if (!editor || editor.role !== "EDITOR") notFound();

  const activity = await getUserActivity(id, {});

  const beatTitles = (editor.beatCategorySlugs ?? [])
    .map((slug) => getCategoryBySlug(slug)?.title)
    .filter((title): title is string => Boolean(title));

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/admin/editors"
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="h-3.5 w-3.5" />
        بازگشت به سردبیران
      </Link>

      <header className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-extrabold text-foreground">{editor.name}</h1>
          <Badge variant={editor.isActive ? "success" : "muted"}>{editor.isActive ? "فعال" : "غیرفعال"}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          نام رمزی (نمایش عمومی):{" "}
          <span dir="ltr" className="font-numeral font-medium text-foreground">
            {reporterCodename(editor.name, editor.createdAt)}
          </span>
        </p>
        <p dir="ltr" className="mt-1 text-left text-xs text-muted-foreground">
          {editor.username} · {editor.email}
        </p>
        {beatTitles.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">بخش‌های خبری: {beatTitles.join("، ")}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">عضویت از {formatJalali(editor.createdAt)}</p>
      </header>

      <UserActivityView userId={id} initialActivity={activity} />
    </div>
  );
}
