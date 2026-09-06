"use client";

import * as React from "react";
import { Newspaper, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { setHeroHeadlineAction, clearHeroHeadlineAction } from "@/app/dashboard/featured-actions";
import { getCategoryBySlug } from "@/lib/mock-data";
import { formatJalali } from "@/lib/utils";

export interface HeroHeadlinePickerItem {
  id: string;
  title: string;
  categorySlug: string;
  isHeroHeadline: boolean;
  publishedAt: string | null;
}

export function HeroHeadlinePicker({ articles }: { articles: HeroHeadlinePickerItem[] }) {
  const [items, setItems] = React.useState(articles);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  const current = items.find((a) => a.isHeroHeadline) ?? null;
  const filtered = items.filter((a) => a.title.includes(query));

  async function handleSelect(id: string) {
    setBusyId(id);
    await setHeroHeadlineAction(id);
    setItems((prev) => prev.map((a) => ({ ...a, isHeroHeadline: a.id === id })));
    setBusyId(null);
  }

  async function handleClear() {
    if (!current) return;
    setBusyId(current.id);
    await clearHeroHeadlineAction();
    setItems((prev) => prev.map((a) => ({ ...a, isHeroHeadline: false })));
    setBusyId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-primary/30 bg-accent/40 p-4">
        <p className="mb-1 text-xs font-medium text-muted-foreground">تیتر اصلی فعلی</p>
        {current ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-1.5">
              <Newspaper className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-bold leading-snug text-foreground">{current.title}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-fit gap-1.5"
              disabled={busyId === current.id}
              onClick={handleClear}
            >
              <X className="h-3.5 w-3.5" />
              حذف
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            هنوز تیتری انتخاب نشده — تا انتخاب نکنید، آخرین خبر منتشرشده به‌جای آن نمایش داده می‌شود.
          </p>
        )}
      </div>

      <Input placeholder="جست‌وجوی عنوان خبر…" value={query} onChange={(e) => setQuery(e.target.value)} />

      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            خبری یافت نشد.
          </p>
        ) : (
          filtered.map((article) => (
            <div
              key={article.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline">{getCategoryBySlug(article.categorySlug)?.title ?? article.categorySlug}</Badge>
                <span className="text-sm font-medium text-foreground">{article.title}</span>
                <span className="text-xs text-muted-foreground">
                  {article.publishedAt ? formatJalali(article.publishedAt) : ""}
                </span>
              </div>
              <Button
                size="sm"
                variant={article.isHeroHeadline ? "secondary" : "outline"}
                disabled={busyId === article.id}
                onClick={() => handleSelect(article.id)}
              >
                {article.isHeroHeadline ? "تیتر اصلی است" : "انتخاب به‌عنوان تیتر اصلی"}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
