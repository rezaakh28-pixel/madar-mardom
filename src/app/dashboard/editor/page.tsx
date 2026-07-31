import { ReviewQueue } from "@/components/dashboard/review-queue";
import { getPendingArticlesForEditor } from "@/lib/content";
import { getCategoryBySlug } from "@/lib/mock-data";
import { getSession } from "@/lib/session";

export default async function EditorDashboardPage() {
  const session = await getSession();
  const beats = session?.user.beatCategorySlugs ?? [];
  const beatCategories = beats.map((slug) => getCategoryBySlug(slug)).filter((c): c is NonNullable<typeof c> => Boolean(c));

  let pending: Awaited<ReturnType<typeof getPendingArticlesForEditor>> = [];
  let dbError: string | null = null;
  try {
    pending = await getPendingArticlesForEditor(beats);
  } catch {
    dbError = "اتصال به پایگاه‌داده برقرار نیست. طبق راهنمای README یک دیتابیس Postgres به پروژه وصل کنید.";
  }

  const beatLabel = beatCategories.length > 0 ? beatCategories.map((c) => c.title).join("، ") : null;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">
          تأیید اخبار{beatLabel ? ` — بخش‌های ${beatLabel}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {beatLabel
            ? `بررسی، ویرایش، تأیید یا رد اخبار بخش‌های «${beatLabel}» و زمان‌بندی انتشار.`
            : "بررسی، ویرایش، تأیید یا رد اخبار ارسالی خبرنگاران و زمان‌بندی انتشار."}
        </p>
      </header>

      {dbError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {dbError}
        </p>
      )}

      <ReviewQueue articles={pending} />
    </div>
  );
}
