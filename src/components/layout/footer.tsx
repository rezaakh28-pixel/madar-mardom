import Link from "next/link";
import { CATEGORIES } from "@/lib/mock-data";

const FOOTER_COLUMNS: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: "بخش‌ها",
    links: CATEGORIES.slice(0, 6).map((c) => ({ href: `/${c.slug}`, label: c.title })),
  },
  {
    title: "درباره ما",
    links: [
      { href: "/about", label: "درباره مدار مردم" },
      { href: "/contact", label: "تماس با ما" },
      { href: "/voice", label: "صدای مردم" },
      { href: "/special-cases", label: "پرونده‌های ویژه" },
    ],
  },
  {
    title: "قوانین",
    links: [
      { href: "/about#ethics", label: "منشور اخلاقی" },
      { href: "/about#privacy", label: "حریم خصوصی" },
      { href: "/about#corrections", label: "اصلاحیه‌ها" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <span className="text-xl font-extrabold">مدار مردم</span>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            خبر از دل جامعه — رسانه‌ای مستقل و مردمی برای روایت زندگی، اقتصاد و مسائل روزمره ایران.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold text-primary-foreground/90">{col.title}</h3>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-primary-foreground/70 hover:text-secondary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row">
          <p>© {new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date())} مدار مردم. تمامی حقوق محفوظ است.</p>
          <p>ساخته‌شده با Next.js — رسانه‌ای مستقل</p>
        </div>
      </div>
    </footer>
  );
}
