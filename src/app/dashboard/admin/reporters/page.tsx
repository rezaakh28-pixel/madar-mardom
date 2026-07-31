import { PendingReporters } from "@/components/dashboard/pending-reporters";
import { ReportersList, type ReporterWithActivity } from "@/components/dashboard/reporters-list";
import { db } from "@/lib/db";
import { getReporterActivity } from "@/lib/content";

export default async function AdminReportersPage() {
  let pending: Awaited<ReturnType<typeof db.user.findMany>> = [];
  let reporters: ReporterWithActivity[] = [];
  let dbError = false;

  try {
    const allReporters = await db.user.findMany({ where: { role: "REPORTER" }, orderBy: { createdAt: "desc" } });
    pending = allReporters.filter((r) => r.approvalStatus === "PENDING");
    const approved = allReporters.filter((r) => r.approvalStatus !== "PENDING");
    reporters = await Promise.all(
      approved.map(async (r) => ({ ...r, activity: await getReporterActivity(r.id) }))
    );
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">خبرنگاران</h1>
        <p className="mt-1 text-sm text-muted-foreground">تأیید ثبت‌نام، مشاهده فعالیت و مدیریت حساب خبرنگاران.</p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : (
        <>
          {pending.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-foreground">
                درخواست‌های در انتظار تأیید ({pending.length})
              </h2>
              <PendingReporters users={pending} />
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-bold text-foreground">خبرنگاران تأییدشده ({reporters.length})</h2>
            <ReportersList reporters={reporters} />
          </section>
        </>
      )}
    </div>
  );
}
