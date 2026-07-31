import { ContactMessagesList } from "@/components/dashboard/contact-messages-list";
import { getContactMessages } from "@/lib/contact";

export default async function AdminContactPage() {
  let messages: Awaited<ReturnType<typeof getContactMessages>> = [];
  let dbError = false;

  try {
    messages = await getContactMessages();
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">تماس با ما</h1>
        <p className="mt-1 text-sm text-muted-foreground">پیام‌های ارسالی از فرم تماس با ما.</p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : (
        <ContactMessagesList
          messages={messages.map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            message: m.message,
            status: m.status,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
      )}
    </div>
  );
}
