import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SPECIAL_CASES } from "@/lib/mock-data";
import { buildPageMetadata } from "@/lib/seo";
import { formatJalali } from "@/lib/utils";

export const metadata: Metadata = buildPageMetadata({
  title: "پرونده‌های ویژه",
  description: "روایت چندرسانه‌ای مدار مردم از مهم‌ترین موضوعات؛ خبر، تحلیل، داده و ویدیو در یک صفحه.",
  path: "/special-cases",
});

export default function SpecialCasesIndexPage() {
  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: "پرونده‌های ویژه", href: "/special-cases" }]} />

      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">پرونده‌های ویژه</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          موضوعاتی که مدار مردم آن‌ها را از زوایای مختلف — خبر، تحلیل، داده و تصویر — دنبال می‌کند.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {SPECIAL_CASES.map((sc) => (
          <Link
            key={sc.slug}
            href={`/special-cases/${sc.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="relative aspect-[16/9] w-full">
              <Image src={sc.coverImage.url} alt={sc.coverImage.alt} fill sizes="500px" className="object-cover" />
            </div>
            <div className="flex flex-col gap-1.5 p-4">
              <h2 className="font-bold text-foreground group-hover:text-primary">{sc.title}</h2>
              <p className="line-clamp-2 text-sm text-muted-foreground">{sc.summary}</p>
              <span className="mt-1 text-xs text-muted-foreground">از {formatJalali(sc.startedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
