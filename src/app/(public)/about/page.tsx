import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "درباره ما",
  description: "مدار مردم، رسانه‌ای مستقل با تمرکز بر جامعه، اقتصاد و زندگی روزمره ایرانیان.",
  path: "/about",
});

const VALUES = ["مردم‌محور", "دقیق", "مستقل", "شفاف", "محترمانه", "داده‌محور"];

export default function AboutPage() {
  return (
    <div className="container-page max-w-2xl py-8">
      <Breadcrumb items={[{ label: "درباره ما", href: "/about" }]} />

      <h1 className="mb-2 text-2xl font-extrabold text-foreground sm:text-3xl">درباره مدار مردم</h1>
      <p className="mb-8 text-sm font-medium text-secondary">خبر از دل جامعه</p>

      <section className="mb-8 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">چشم‌انداز</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          رسانه‌ای مستقل و مردمی که با محوریت جامعه، اقتصاد و زندگی روزمره مردم، اخبار، تحلیل و داده را با
          زبانی ساده، دقیق و قابل‌اعتماد روایت می‌کند.
        </p>
      </section>

      <section className="mb-8 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">مأموریت</h2>
        <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <li>روایت واقعیت</li>
          <li>شنیدن صدای مردم</li>
          <li>ساده‌سازی موضوعات پیچیده</li>
          <li>تصمیم‌سازی مبتنی بر داده</li>
          <li>ارتقای سواد رسانه‌ای</li>
        </ul>
      </section>

      <section id="ethics" className="mb-8 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">ارزش‌ها و منشور اخلاقی</h2>
        <div className="flex flex-wrap gap-2">
          {VALUES.map((v) => (
            <span key={v} className="rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {v}
            </span>
          ))}
        </div>
      </section>

      <section id="privacy" className="mb-8 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">حریم خصوصی</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          اطلاعات هویتی افرادی که از طریق «صدای مردم» گزارش ارسال می‌کنند، بدون رضایت صریح آنان منتشر نخواهد شد.
        </p>
      </section>

      <section id="corrections" className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">اصلاحیه‌ها</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          در صورت مشاهده هرگونه خطا در گزارش‌های مدار مردم، از طریق صفحه تماس با ما به تیم تحریریه اطلاع دهید.
        </p>
      </section>
    </div>
  );
}
