"use client";

import * as React from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { setFeaturedArticleAction, clearFeaturedArticleAction } from "@/app/dashboard/featured-actions";
import { getCategoryBySlug } from "@/lib/mock-data";
import { formatJalali } from "@/lib/utils";

export interface FeaturedPickerItem {
  id: string;
  title: string;
  categorySlug: string;
  featuredRank: number | null;
  publishedAt: string | null;
}

const RANKS = [1, 2, 3] as const;
type Rank = (typeof RANKS)[number];

const RANK_LABELS: Record<Rank, string> = {
  1: "خبر ویژه اول",
  2: "خبر ویژه دوم",
  3: "خبر ویژه سوم",
};
const RANK_SHORT_LABELS: Record<Rank, string> = { 1: "اول", 2: "دوم", 3: "سوم" };

export function FeaturedArticlePicker({ articles }: { articles: FeaturedPickerItem[] }) {
  const [items, setItems] = React.useState(articles);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  const slots = RANKS.map((rank) => ({ rank, article: items.find((a) => a.featuredRank === rank) ?? null }));
  const filtered = items.filter((a) => a.title.includes(query));

  async function handleSetRank(id: string, rank: Rank) {
    setBusyId(id);
    await setFeaturedArticleAction(id, rank);
    setItems((prev) =>
      prev.map((a) => {
        if (a.id === id) return { ...a, featuredRank: rank };
        if (a.featuredRank === rank) return { ...a, featuredRank: null };
        return a;
      })
    );
    setBusyId(null);
  }

  async function handleClear(rank: Rank) {
    const current = items.find((a) => a.featuredRank === rank);
    if (!current) return;
    setBusyId(current.id);
    await clearFeaturedArticleAction(rank);
    setItems((prev) => prev.map((a) => (a.featuredRank === rank ? { ...a, featuredRank: null } : a)));
    setBusyId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        هر ۳ جایگاه به‌صورت اسلایدر در صفحه اصلی نمایش داده می‌شوند و هر ۳۰ ثانیه به‌طور خودکار جابه‌جا می‌شوند؛
        کاربران هم می‌توانند با دو دکمه فلش بین آن‌ها جابه‌جا شوند.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {slots.map(({ rank, article }) => (
          <div key={rank} className="rounded-lg border border-primary/30 bg-accent/40 p-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">{RANK_LABELS[rank]}</p>
            {article ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-1.5">
                  <Star className="mt-0.5 h-4 w-4 shrink-0 fill-secondary text-secondary" />
                  <span className="text-sm font-bold leading-snug text-foreground">{article.title}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-fit gap-1.5"
                  disabled={busyId === article.id}
                  onClick={() => handleClear(rank)}
                >
                  <X className="h-3.5 w-3.5" />
                  حذف
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">خبری برای این جایگاه انتخاب نشده است.</p>
            )}
          </div>
        ))}
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
              <div className="flex items-center gap-1.5">
                {RANKS.map((rank) => (
                  <Button
                    key={rank}
                    size="sm"
                    variant={article.featuredRank === rank ? "secondary" : "outline"}
                    disabled={busyId === article.id}
                    onClick={() => handleSetRank(article.id, rank)}
                  >
                    {RANK_SHORT_LABELS[rank]}
                  </Button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
