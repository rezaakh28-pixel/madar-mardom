import { FileText, Clock, Eye, TrendingUp, Users, UserCog, MessageSquare, Megaphone, FileX, FileWarning } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { getDetailedSiteStats } from "@/lib/content";
import { getCategoryBySlug } from "@/lib/mock-data";
import { formatFa } from "@/lib/utils";

export default async function AdminStatsPage() {
  let stats: Awaited<ReturnType<typeof getDetailedSiteStats>> | null = null;
  let dbError = false;

  try {
    stats = await getDetailedSiteStats();
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">آمار سایت</h1>
        <p className="mt-1 text-sm text-muted-foreground">نمای کلی و دقیق از وضعیت محتوا، کاربران و فعالیت‌های سایت.</p>
      </header>

      {dbError || !stats ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-sm font-bold text-muted-foreground">محتوا</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="اخبار منتشرشده" value={stats.totalPublished} icon={FileText} />
              <StatCard label="منتشرشده این هفته" value={stats.publishedThisWeek} icon={TrendingUp} />
              <StatCard label="در انتظار بررسی" value={stats.pendingReview} icon={Clock} />
              <StatCard label="پیش‌نویس‌ها" value={stats.totalDrafts} icon={FileX} />
              <StatCard label="ردشده‌ها" value={stats.totalRejected} icon={FileWarning} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold text-muted-foreground">بازدید</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="کل بازدید مطالب" value={stats.totalViews} icon={Eye} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold text-muted-foreground">کاربران</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="خبرنگاران" value={stats.totalReporters} icon={Users} />
              <StatCard label="خبرنگاران فعال" value={stats.activeReporters} icon={Users} />
              <StatCard label="در انتظار تأیید" value={stats.pendingReporterApprovals} icon={Clock} />
              <StatCard label="سردبیران" value={stats.totalEditors} icon={UserCog} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold text-muted-foreground">صدای مردم و پیام‌ها</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="گزارش‌های صدای مردم" value={stats.totalVoiceSubmissions} icon={Megaphone} />
              <StatCard label="در انتظار بررسی" value={stats.pendingVoiceSubmissions} icon={Clock} />
              <StatCard label="پیام‌های تماس با ما" value={stats.totalContactMessages} icon={MessageSquare} />
              <StatCard label="پیام‌های خوانده‌نشده" value={stats.unreadContactMessages} icon={MessageSquare} />
            </div>
          </section>

          {stats.categoryBreakdown.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-muted-foreground">اخبار به تفکیک بخش</h2>
              <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full text-sm">
                  <tbody>
                    {stats.categoryBreakdown.map((c) => (
                      <tr key={c.slug} className="border-b border-border last:border-0">
                        <td className="p-3 font-medium text-foreground">{getCategoryBySlug(c.slug)?.title ?? c.slug}</td>
                        <td className="p-3 text-left font-numeral text-muted-foreground">{formatFa(c.count)} خبر</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
