"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserActivityAction } from "@/app/dashboard/admin/activity-actions";
import { CATEGORIES, getCategoryBySlug } from "@/lib/mock-data";
import { formatFa, formatJalali } from "@/lib/utils";
import type { ActivityPeriod, UserActivitySummary } from "@/lib/content";
import type { ArticleStatus } from "@/types";

const STATUS_LABEL_FA: Record<ArticleStatus, string> = {
  DRAFT: "پیش‌نویس",
  PENDING_REVIEW: "در انتظار بررسی",
  PUBLISHED: "منتشرشده",
  REJECTED: "ردشده",
  ARCHIVED: "بایگانی‌شده",
};

const STATUS_VARIANT: Record<ArticleStatus, "muted" | "secondary" | "success" | "danger"> = {
  DRAFT: "muted",
  PENDING_REVIEW: "secondary",
  PUBLISHED: "success",
  REJECTED: "danger",
  ARCHIVED: "muted",
};

const PERIOD_OPTIONS: { value: ActivityPeriod; label: string }[] = [
  { value: "week", label: "هفته اخیر" },
  { value: "month", label: "ماه اخیر" },
  { value: "year", label: "سال اخیر" },
  { value: "all", label: "کل دوره فعالیت" },
];

export function UserActivityView({
  userId,
  initialActivity,
}: {
  userId: string;
  initialActivity: UserActivitySummary;
}) {
  const [period, setPeriod] = React.useState<ActivityPeriod>("all");
  const [category, setCategory] = React.useState<string>("all");
  const [activity, setActivity] = React.useState(initialActivity);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUserActivityAction(userId, { period, categorySlug: category === "all" ? undefined : category }).then(
      (res) => {
        if (cancelled) return;
        if (res.ok && res.activity) setActivity(res.activity);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [userId, period, category]);

  const { authored, reviewed } = activity;

  return (
    <div className={`flex flex-col gap-8 transition-opacity ${loading ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPeriod(opt.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                period === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته‌ها</SelectItem>
            {CATEGORIES.filter((c) => c.slug !== "voice").map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold text-foreground">اخبار تولیدشده</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="مجموع" value={authored.total} />
          <StatCard label="منتشرشده" value={authored.byStatus.PUBLISHED} />
          <StatCard label="در انتظار بررسی" value={authored.byStatus.PENDING_REVIEW} />
          <StatCard label="پیش‌نویس" value={authored.byStatus.DRAFT} />
          <StatCard label="ردشده" value={authored.byStatus.REJECTED} />
          <StatCard label="مجموع بازدید" value={authored.totalViews} />
        </div>

        {authored.byCategory.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {authored.byCategory.map((c) => (
              <Badge key={c.slug} variant="outline">
                {getCategoryBySlug(c.slug)?.title ?? c.slug}: {formatFa(c.count)}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {authored.articles.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              در این بازه‌ی زمانی/دسته‌بندی خبری ثبت نشده است.
            </p>
          ) : (
            authored.articles.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-3 text-sm"
              >
                <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL_FA[a.status]}</Badge>
                <Badge variant="outline">{getCategoryBySlug(a.categorySlug)?.title ?? a.categorySlug}</Badge>
                {a.status === "PUBLISHED" ? (
                  <Link
                    href={`/news/${a.slug}`}
                    target="_blank"
                    className="flex-1 font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {a.title}
                  </Link>
                ) : (
                  <span className="flex-1 font-medium text-foreground">{a.title}</span>
                )}
                <span className="font-numeral text-xs text-muted-foreground">{formatFa(a.viewCount)} بازدید</span>
                <span className="text-xs text-muted-foreground">
                  {a.publishedAt ? formatJalali(a.publishedAt) : formatJalali(a.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-foreground">فعالیت‌های بررسی و انتشار (سردبیری)</h2>
        <div className="grid grid-cols-3 gap-3 sm:max-w-md">
          <StatCard label="مجموع بررسی" value={reviewed.total} />
          <StatCard label="منتشرشده" value={reviewed.published} />
          <StatCard label="ردشده" value={reviewed.rejected} />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {reviewed.articles.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              در این بازه‌ی زمانی/دسته‌بندی، خبری بررسی نشده است.
            </p>
          ) : (
            reviewed.articles.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-3 text-sm"
              >
                <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL_FA[a.status]}</Badge>
                <Badge variant="outline">{getCategoryBySlug(a.categorySlug)?.title ?? a.categorySlug}</Badge>
                <span className="flex-1 font-medium text-foreground">{a.title}</span>
                <span className="text-xs text-muted-foreground">خبرنگار: {a.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {a.reviewedAt ? formatJalali(a.reviewedAt) : "—"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="font-numeral text-xl font-extrabold text-foreground">{formatFa(value)}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
