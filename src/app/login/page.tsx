import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/login/login-form";
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
        </div>

        <LoginForm next={next} />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          خبرنگار هستید و هنوز حساب ندارید؟{" "}
          <Link href="/register" className="text-primary hover:underline">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
}
