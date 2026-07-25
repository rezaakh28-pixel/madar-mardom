import { ReviewQueue } from "@/components/dashboard/review-queue";
import { getPendingArticles, getCategoryBySlug } from "@/lib/mock-data";
import { getSession } from "@/lib/session";

export default async function EditorDashboardPage() {
  const session = await getSession();
  const beatSlug = session?.user.beatCategorySlug;
  const beatCategory = beatSlug ? getCategoryBySlug(beatSlug) : undefined;

  const allPending = getPendingArticles();
  const pending = beatSlug ? allPending.filter((a) => a.category.slug === beatSlug) : allPending;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">
          پنل سردبیر{beatCategory ? ` — بخش ${beatCategory.title}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {beatCategory
            ? `بررسی، تأیید یا رد اخبار بخش «${beatCategory.title}» و زمان‌بندی انتشار.`
            : "بررسی، تأیید یا رد اخبار ارسالی خبرنگاران و زمان‌بندی انتشار."}
        </p>
      </header>

      <ReviewQueue articles={pending} />
    </div>
  );
}
