import type { Metadata } from "next";
import Image from "next/image";
import { loginAsReporterAction, loginAsEditorAction, loginAsAdminAction } from "./actions";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ورود",
  description: "ورود به پنل داخلی مدار مردم.",
  path: "/login",
});

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="relative h-12 w-12 overflow-hidden rounded-md">
            <Image src="/logo.jpg" alt="مدار مردم" fill sizes="48px" className="object-cover" priority />
          </span>
          <h1 className="text-lg font-extrabold text-primary">ورود به پنل داخلی</h1>
          <p className="text-xs leading-relaxed text-muted-foreground">
            این یک ورود نمایشی است — نقش مورد نظر را انتخاب کنید تا وارد همان پنل شوید.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <form action={loginAsReporterAction}>
            <input type="hidden" name="next" value={next ?? ""} />
            <Button type="submit" variant="outline" className="w-full">
              ورود به‌عنوان خبرنگار
            </Button>
          </form>
          <form action={loginAsEditorAction}>
            <input type="hidden" name="next" value={next ?? ""} />
            <Button type="submit" variant="outline" className="w-full">
              ورود به‌عنوان سردبیر
            </Button>
          </form>
          <form action={loginAsAdminAction}>
            <input type="hidden" name="next" value={next ?? ""} />
            <Button type="submit" className="w-full">
              ورود به‌عنوان مدیر
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          حساب کاربری و رمز عبور واقعی هنوز وصل نشده — این صفحه فقط برای پیش‌نمایش پنل‌های داخلی است.
        </p>
      </div>
    </div>
  );
}
