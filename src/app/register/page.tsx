import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function RegisterSubmittedPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-rise" />
        <h1 className="text-lg font-extrabold text-foreground">درخواست شما ثبت شد</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          پس از بررسی و تأیید توسط مدیر، می‌توانید با نام کاربری و رمز عبوری که وارد کردید وارد پنل خبرنگار شوید.
        </p>
        <Link href="/" className="text-sm text-primary hover:underline">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
