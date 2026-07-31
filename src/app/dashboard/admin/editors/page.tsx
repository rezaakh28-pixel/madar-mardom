import { CreateEditorForm } from "@/components/dashboard/create-editor-form";
import { EditorsManager } from "@/components/dashboard/editors-manager";
import { db } from "@/lib/db";

export default async function AdminEditorsPage() {
  let editors: Awaited<ReturnType<typeof db.user.findMany>> = [];
  let dbError = false;

  try {
    editors = await db.user.findMany({ where: { role: "EDITOR" }, orderBy: { createdAt: "desc" } });
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">سردبیران</h1>
        <p className="mt-1 text-sm text-muted-foreground">ساخت حساب سردبیر جدید، تعیین بخش‌های خبری و مدیریت حساب‌ها.</p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-lg font-bold text-foreground">افزودن سردبیر جدید</h2>
            <CreateEditorForm />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-foreground">سردبیران ({editors.length})</h2>
            <EditorsManager editors={editors} />
          </section>
        </>
      )}
    </div>
  );
}
