import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DraftsList, type DraftListItem } from "@/components/dashboard/drafts-list";
import { getReporterArticles } from "@/lib/content";
import { getCategoryBySlug } from "@/lib/mock-data";
import { getSession } from "@/lib/session";

export default async function ReporterDraftsPage() {
  const session = await getSession();

  let drafts: DraftListItem[] = [];
  let dbError = false;
  try {
    const articles = await getReporterArticles(session!.user.id);
    drafts = articles.map((a) => ({
      id: a.id,
      title: a.title,
      categoryTitle: getCategoryBySlug(a.categorySlug)?.title ?? a.categorySlug,
      status: a.status,
      updatedAt: a.updatedAt.toISOString(),
      reviewNote: a.reviewNote,
    }));
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">پیش‌نویس‌های من</h1>
          <p className="mt-1 text-sm text-muted-foreground">خبرهایی که ذخیره کرده‌اید یا برای سردبیر فرستاده‌اید.</p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/dashboard/reporter">
            <PlusCircle className="h-4 w-4" />
            خبر جدید
          </Link>
        </Button>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : (
        <DraftsList drafts={drafts} />
      )}
    </div>
  );
}
