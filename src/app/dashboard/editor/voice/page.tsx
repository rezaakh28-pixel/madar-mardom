import { VoiceModerationQueue } from "@/components/dashboard/voice-moderation-queue";
import { listVoiceSubmissions } from "@/lib/voice-store";

export default async function EditorVoicePage() {
  let submissions: Awaited<ReturnType<typeof listVoiceSubmissions>> = [];
  let dbError = false;

  try {
    submissions = await listVoiceSubmissions();
  } catch {
    dbError = true;
  }

  const pending = submissions.filter((s) => s.status === "SUBMITTED" || s.status === "IN_REVIEW");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">صدای مردم</h1>
        <p className="mt-1 text-sm text-muted-foreground">گزارش‌های ارسالی مردم را بررسی، تأیید یا رد کنید.</p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : (
        <VoiceModerationQueue items={pending} />
      )}
    </div>
  );
}
