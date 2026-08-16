import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { UserActivityView } from "@/components/dashboard/user-activity-view";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { getUserActivity } from "@/lib/content";
import { reporterCodename } from "@/lib/codename";
import { formatJalali } from "@/lib/utils";

export default async function ReporterActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const reporter = await db.user.findUnique({ where: { id } });
  if (!reporter || reporter.role !== "REPORTER") notFound();

  const activity = await getUserActivity(id, {});

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/admin/reporters"
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="h-3.5 w-3.5" />
        بازگشت به خبرنگاران
      </Link>

      <header className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-extrabold text-foreground">{reporter.name}</h1>
          <Badge variant={reporter.isActive ? "success" : "muted"}>
            {reporter.isActive ? "فعال" : "غیرفعال"}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          نام رمزی (نمایش عمومی):{" "}
          <span dir="ltr" className="font-numeral font-medium text-foreground">
            {reporterCodename(reporter.name, reporter.createdAt)}
          </span>
        </p>
        <p dir="ltr" className="mt-1 text-left text-xs text-muted-foreground">
          {reporter.username} · {reporter.email}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">عضویت از {formatJalali(reporter.createdAt)}</p>
      </header>

      <UserActivityView userId={id} initialActivity={activity} />
    </div>
  );
}
