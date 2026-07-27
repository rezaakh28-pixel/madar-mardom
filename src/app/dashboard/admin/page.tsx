import { FileText, Users, Clock, Eye, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserTable } from "@/components/dashboard/user-table";
import { PendingReporters } from "@/components/dashboard/pending-reporters";
import { CreateEditorForm } from "@/components/dashboard/create-editor-form";
import { EditorsManager } from "@/components/dashboard/editors-manager";
import { PulseEditForm } from "@/components/dashboard/pulse-edit-form";
import { getSiteStats } from "@/lib/content";
import { getPulseItems } from "@/lib/pulse";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

export default async function AdminDashboardPage() {
  let users: User[] = [];
  let stats = { totalArticles: 0, publishedThisWeek: 0, pendingReview: 0, totalViews: 0 };
  let pulseItems: Awaited<ReturnType<typeof getPulseItems>> = [];
  let dbError: string | null = null;

  try {
    [users, stats, pulseItems] = await Promise.all([
      db.user.findMany({ orderBy: { createdAt: "desc" } }),
      getSiteStats(),
      getPulseItems(),
    ]);
  } catch {
    dbError =
      "اتصال به پایگاه‌داده برقرار نیست. برای مدیریت کاربران و آمار، ابتدا یک دیتابیس Postgres را طبق راهنمای README به پروژه وصل کنید.";
  }

  const pending = users.filter((u) => u.approvalStatus === "PENDING");
  const editors = users.filter((u) => u.role === "EDITOR");
  const otherUsers = users.filter((u) => u.approvalStatus !== "PENDING" && u.role !== "EDITOR");
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
        <StatCard label="کل بازدید مطالب" value={stats.totalViews} icon={Eye} />
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
        <h2 className="mb-3 text-lg font-bold text-foreground">سردبیران ({editors.length})</h2>
        <EditorsManager editors={editors} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">سایر کاربران</h2>
        <UserTable users={otherUsers} />
      </section>

      {!dbError && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">ویرایش اطلاعات «نبض جامعه»</h2>
          <p className="mb-3 text-sm text-muted-foreground">این اطلاعات در صفحه اصلی سایت نمایش داده می‌شود.</p>
          <PulseEditForm items={pulseItems} />
        </section>
      )}
    </div>
  );
}
