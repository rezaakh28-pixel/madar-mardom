import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { formatFa } from "@/lib/utils";

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const keep = new Set<number>([1, total, current, current - 1, current + 1, current - 2, current + 2]);
  const sorted = [...keep].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

/**
 * Server-rendered page-number links (no client JS) — each page is a real
 * URL (`?page=N`), so it works without JavaScript and is crawlable. Used at
 * the bottom of category ("موضوعات") listings; the number of pages is
 * always derived from the live article count, so it grows automatically as
 * more articles are published.
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  function pageHref(page: number) {
    return page <= 1 ? basePath : `${basePath}?page=${page}`;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="صفحه‌بندی" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        aria-label="صفحه قبلی"
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : undefined}
        className={`flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm transition-colors ${
          currentPage === 1 ? "pointer-events-none opacity-40" : "hover:bg-accent"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>

      {pageNumbers.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-md border px-2 font-numeral text-sm transition-colors ${
              p === currentPage
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-accent"
            }`}
          >
            {formatFa(p)}
          </Link>
        )
      )}

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        aria-label="صفحه بعدی"
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : undefined}
        className={`flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm transition-colors ${
          currentPage === totalPages ? "pointer-events-none opacity-40" : "hover:bg-accent"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
    </nav>
  );
}
