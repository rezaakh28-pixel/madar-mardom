import { toPersianDigits } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public "کد رمزی" pseudonym — used for reporters, editors, and admins alike.
//
// For security/anonymity, staff real names must never appear on public
// pages (byline, author page) — only inside internal dashboards. Instead,
// every public surface shows this deterministic codename: it's derived from
// the initials of the person's first/last name plus their join (Jalali)
// year and a short hash-based suffix (for uniqueness among people who share
// initials and a join year), so the same person always gets the same code
// without storing anything extra in the database.
//
// Used by mapAuthor()/mapArticle() in src/lib/content.ts (public viewer),
// and shown *alongside* the real name in the admin's reporters/editors
// panels (src/components/dashboard/reporters-list.tsx and
// editors-manager.tsx) so admins can match one to the other.
// ---------------------------------------------------------------------------

export function reporterCodename(name: string, joinedAt: Date | string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "خ";
  const last = parts.length > 1 ? parts[parts.length - 1]! : first;
  const firstInitial = first.charAt(0);
  const lastInitial = last.charAt(0);

  const d = typeof joinedAt === "string" ? new Date(joinedAt) : joinedAt;
  const jalaliYear = new Intl.DateTimeFormat("fa-IR-u-nu-latn", { year: "numeric" }).format(d);

  // Short deterministic hash from name + join date, so two reporters with
  // the same initials and join year still get distinct codes.
  const seed = `${name}|${d.toISOString().slice(0, 10)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const suffix = String(100 + (hash % 900)); // always 3 digits, 100-999

  return toPersianDigits(`${firstInitial}.${lastInitial}-${jalaliYear}.${suffix}`);
}
