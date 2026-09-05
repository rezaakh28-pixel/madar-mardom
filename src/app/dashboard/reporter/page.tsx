import Link from "next/link";
import { FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleForm } from "@/components/dashboard/article-form";

export default function ReporterDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">پنل خبرنگار</h1>
          <p className="mt-1 text-sm text-muted-foreground">خبر جدید بنویسید یا پیش‌نویس خود را ادامه دهید.</p>
        </div>
        <Button variant="outline" className="gap-1.5" asChild>
          <Link href="/dashboard/reporter/drafts">
            <FileStack className="h-4 w-4" />
            پیش‌نویس‌های من
          </Link>
        </Button>
      </header>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <ArticleForm />
      </div>
    </div>
  );
}
