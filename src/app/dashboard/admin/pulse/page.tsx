import { PulseEditForm } from "@/components/dashboard/pulse-edit-form";
import { getPulseItems } from "@/lib/pulse";

export default async function AdminPulsePage() {
  let items: Awaited<ReturnType<typeof getPulseItems>> = [];
  let dbError = false;

  try {
    items = await getPulseItems();
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">نبض جامعه</h1>
        <p className="mt-1 text-sm text-muted-foreground">این اطلاعات در صفحه اصلی سایت نمایش داده می‌شود.</p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : (
        <PulseEditForm items={items} />
      )}
    </div>
  );
}
