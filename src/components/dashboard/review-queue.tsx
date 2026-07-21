"use client";

import * as React from "react";
import { Check, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { NewsArticle } from "@/types";
import { approveArticleAction, rejectArticleAction, restoreRevisionAction } from "@/app/(dashboard)/editor/actions";
import { timeAgoFa } from "@/lib/utils";

export function ReviewQueue({ articles }: { articles: NewsArticle[] }) {
  const [items, setItems] = React.useState(articles);
  const [scheduleFor, setScheduleFor] = React.useState<Record<string, string>>({});
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function handleApprove(article: NewsArticle) {
    setBusyId(article.id);
    await approveArticleAction(article.id, scheduleFor[article.id]);
    setItems((prev) => prev.filter((a) => a.id !== article.id));
    setBusyId(null);
  }

  async function handleReject(article: NewsArticle) {
    setBusyId(article.id);
    await rejectArticleAction(article.id, "نیاز به بازنویسی");
    setItems((prev) => prev.filter((a) => a.id !== article.id));
    setBusyId(null);
  }

  async function handleRestore(article: NewsArticle) {
    await restoreRevisionAction(article.id, "rev_previous");
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        هیچ خبری در انتظار بررسی نیست.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((article) => (
        <div key={article.id} className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="secondary">{article.category.title}</Badge>
                <span className="text-xs text-muted-foreground">
                  {article.author.name} · {timeAgoFa(article.publishedAt)}
                </span>
              </div>
              <h3 className="font-bold text-foreground">{article.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.lead}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Input
              type="datetime-local"
              className="h-9 w-52 font-numeral"
              aria-label="زمان انتشار"
              value={scheduleFor[article.id] ?? ""}
              onChange={(e) => setScheduleFor((prev) => ({ ...prev, [article.id]: e.target.value }))}
            />
            <Button size="sm" className="gap-1.5" disabled={busyId === article.id} onClick={() => handleApprove(article)}>
              <Check className="h-3.5 w-3.5" />
              تأیید و زمان‌بندی انتشار
            </Button>
            <Button size="sm" variant="destructive" className="gap-1.5" disabled={busyId === article.id} onClick={() => handleReject(article)}>
              <X className="h-3.5 w-3.5" />
              رد کردن
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleRestore(article)}>
              <History className="h-3.5 w-3.5" />
              بازیابی نسخه قبلی
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
