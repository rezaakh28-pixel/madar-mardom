import { ArticleForm } from "@/components/dashboard/article-form";

export default function ReporterDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">پنل خبرنگار</h1>
        <p className="mt-1 text-sm text-muted-foreground">خبر جدید بنویسید یا پیش‌نویس خود را ادامه دهید.</p>
      </header>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <ArticleForm />
      </div>
    </div>
  );
}
