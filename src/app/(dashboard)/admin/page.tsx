import { FileText, Users, Clock, Eye, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserTable } from "@/components/dashboard/user-table";
import { getDashboardUsers, getSiteStats } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const stats = getSiteStats();
  const users = getDashboardUsers();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">پنل مدیر</h1>
        <p className="mt-1 text-sm text-muted-foreground">آمار کلی سایت، مدیریت کاربران و نقش‌ها.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="کل مطالب" value={stats.totalArticles} icon={FileText} />
        <StatCard label="منتشرشده این هفته" value={stats.publishedThisWeek} icon={TrendingUp} />
        <StatCard label="خبرنگاران فعال" value={stats.activeReporters} icon={Users} />
        <StatCard label="در انتظار بررسی" value={stats.pendingReview} icon={Clock} />
        <StatCard label="بازدید امروز" value={stats.totalViewsToday} icon={Eye} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">مدیریت کاربران</h2>
        <UserTable users={users} />
      </section>
    </div>
  );
}
