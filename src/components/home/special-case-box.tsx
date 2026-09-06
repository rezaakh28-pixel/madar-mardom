import Link from "next/link";
import Image from "next/image";
import { FolderOpen, ChevronLeft } from "lucide-react";
import type { HomeSpecialCase } from "@/lib/content";
import { formatFa } from "@/lib/utils";

/** Homepage box for the latest "پرونده ویژه" (special case/dossier) — sized to match MostVisited beside it. */
export function SpecialCaseBox({ specialCase }: { specialCase: HomeSpecialCase | null }) {
  if (!specialCase) return null;

  return (
    <section aria-labelledby="special-case-heading" className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <FolderOpen className="h-4 w-4 text-secondary" />
        <h2 id="special-case-heading" className="text-sm font-extrabold text-foreground">
          پرونده ویژه
        </h2>
      </div>

      <Link href={`/special-cases/${specialCase.slug}`} className="group block">
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
          <Image
            src={specialCase.coverImageUrl || "/covers/placeholder.jpg"}
            alt={specialCase.title}
            fill
            sizes="(min-width: 1024px) 25vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col gap-2 p-4 pb-3">
          <h3 className="text-balance font-bold leading-snug text-foreground group-hover:text-primary">
            {specialCase.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{specialCase.summary}</p>
        </div>
      </Link>

      {specialCase.recentArticles.length > 0 && (
        <ul className="flex flex-1 flex-col gap-2 px-4 pb-3">
          {specialCase.recentArticles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/news/${a.slug}`}
                className="flex items-start gap-1.5 text-sm text-foreground hover:text-primary"
              >
                <ChevronLeft className="mt-1 h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="line-clamp-1">{a.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/special-cases/${specialCase.slug}`}
        className="mt-auto flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground hover:text-primary"
      >
        <span>{formatFa(specialCase.articleCount)} خبر و گزارش</span>
        <span className="flex items-center gap-0.5 font-medium text-primary">
          مشاهده پرونده
          <ChevronLeft className="h-3 w-3" />
        </span>
      </Link>
    </section>
  );
}
