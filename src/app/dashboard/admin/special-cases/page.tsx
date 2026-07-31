import { SpecialCasesManager } from "@/components/dashboard/special-cases-manager";
import { listSpecialCases } from "@/lib/content";

export default async function AdminSpecialCasesPage() {
  let cases: Awaited<ReturnType<typeof listSpecialCases>> = [];
  let dbError = false;

  try {
    cases = await listSpecialCases();
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">پرونده‌های ویژه</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          یک پرونده بسازید و اخبار مرتبط با آن موضوع را به آن اضافه کنید — همه با هم در صفحه‌ی پرونده روی سایت نمایش داده می‌شوند.
        </p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : (
        <SpecialCasesManager
          basePath="/dashboard/admin/special-cases"
          cases={cases.map((c) => ({
            id: c.id,
            slug: c.slug,
            title: c.title,
            summary: c.summary,
            createdAt: c.createdAt.toISOString(),
            articleCount: c._count.articles,
          }))}
        />
      )}
    </div>
  );
}
