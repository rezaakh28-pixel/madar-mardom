import { ReviewQueue } from "@/components/dashboard/review-queue";
import { getPendingArticles } from "@/lib/mock-data";

export default function EditorDashboardPage() {
  const pending = getPendingArticles();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">پنل سردبیر</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          بررسی، تأیید یا رد اخبار ارسالی خبرنگاران و زمان‌بندی انتشار.
        </p>
      </header>

      <ReviewQueue articles={pending} />
    </div>
  );
}
