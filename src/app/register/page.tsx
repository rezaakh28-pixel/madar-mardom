import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components/register/register-form";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ثبت‌نام خبرنگار",
  description: "درخواست عضویت به‌عنوان خبرنگار در مدار مردم.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="relative h-12 w-12 overflow-hidden rounded-md">
            <Image src="/logo.jpg" alt="مدار مردم" fill sizes="48px" className="object-cover" priority />
          </span>
          <h1 className="text-lg font-extrabold text-primary">ثبت‌نام خبرنگار</h1>
          <p className="text-xs leading-relaxed text-muted-foreground">
            پس از تأیید مدیر، می‌توانید با همین نام کاربری و رمز عبور وارد پنل خبرنگار شوید. حساب سردبیر و مدیر فقط توسط مدیر سایت ساخته می‌شود.
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          حساب دارید؟{" "}
          <Link href="/login" className="text-primary hover:underline">
            ورود
          </Link>
        </p>
      </div>
    </div>
  );
}
