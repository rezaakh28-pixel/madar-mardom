import { FileText, Users, Clock, Eye, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserTable } from "@/components/dashboard/user-table";
import { PendingReporters } from "@/components/dashboard/pending-reporters";
import { CreateEditorForm } from "@/components/dashboard/create-editor-form";
import { getSiteStats } from "@/lib/mock-data";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

export default async function AdminDashboardPage() {
  const stats = getSiteStats();

  let users: User[] = [];
  let dbError: string | null = null;
  try {
    users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    dbError =
      "اتصال به پایگاه‌داده برقرار نیست. برای مدیریت کاربران، ابتدا یک دیتابیس Postgres را طبق راهنمای README به پروژه وصل کنید.";
  }

  const pending = users.filter((u) => u.approvalStatus === "PENDING");
  const otherUsers = users.filter((u) => u.approvalStatus !== "PENDING");
  const activeReportersCount = users.filter(
    (u) => u.role === "REPORTER" && u.isActive && u.approvalStatus === "APPROVED"
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">پنل مدیر</h1>
        <p className="mt-1 text-sm text-muted-foreground">آمار کلی سایت، تأیید ثبت‌نام‌ها و مدیریت کاربران.</p>
      </header>

      {dbError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {dbError}
        </p>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="کل مطالب" value={stats.totalArticles} icon={FileText} />
        <StatCard label="منتشرشده این هفته" value={stats.publishedThisWeek} icon={TrendingUp} />
        <StatCard label="خبرنگاران فعال" value={activeReportersCount} icon={Users} />
        <StatCard label="در انتظار بررسی خبر" value={stats.pendingReview} icon={Clock} />
        <StatCard label="بازدید امروز" value={stats.totalViewsToday} icon={Eye} />
      </section>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            درخواست‌های ثبت‌نام خبرنگار در انتظار تأیید ({pending.length})
          </h2>
          <PendingReporters users={pending} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">افزودن سردبیر جدید</h2>
        <CreateEditorForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">همه کاربران</h2>
        <UserTable users={otherUsers} />
      </section>
    </div>
  );
}
