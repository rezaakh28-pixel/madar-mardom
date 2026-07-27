"use client";

import * as React from "react";
import { Check, X, Zap, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JalaliDateTimePicker } from "@/components/dashboard/jalali-date-picker";
import type { NewsArticle } from "@/types";
import {
  publishNowAction,
  scheduleArticleAction,
  rejectArticleAction,
  updateArticleAction,
} from "@/app/dashboard/editor/actions";
import { CATEGORIES } from "@/lib/mock-data";
import { timeAgoFa, formatJalali } from "@/lib/utils";

function EditForm({
  article,
  onCancel,
  onSaved,
}: {
  article: NewsArticle;
  onCancel: () => void;
  onSaved: (updated: Partial<NewsArticle>) => void;
}) {
  const [title, setTitle] = React.useState(article.title);
  const [deck, setDeck] = React.useState(article.deck ?? "");
  const [lead, setLead] = React.useState(article.lead);
  const [body, setBody] = React.useState(article.body);
  const [category, setCategory] = React.useState(article.category.slug);
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    await updateArticleAction(article.id, { title, deck, lead, body, categorySlug: category });
    setSaving(false);
    onSaved({ title, deck, lead, body });
    onCancel();
  }

  return (
    <div className="flex flex-col gap-3 rounded-md bg-muted/40 p-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-title-${article.id}`}>تیتر</Label>
        <Input id={`edit-title-${article.id}`} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-deck-${article.id}`}>روتیتر</Label>
        <Input id={`edit-deck-${article.id}`} value={deck} onChange={(e) => setDeck(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-lead-${article.id}`}>لید</Label>
        <Textarea id={`edit-lead-${article.id}`} rows={3} value={lead} onChange={(e) => setLead(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-body-${article.id}`}>متن کامل</Label>
        <Textarea id={`edit-body-${article.id}`} rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-category-${article.id}`}>دسته‌بندی</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id={`edit-category-${article.id}`} className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.filter((c) => c.slug !== "voice").map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" className="gap-1.5" disabled={saving} onClick={handleSave}>
          <Save className="h-3.5 w-3.5" />
          {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
          انصراف
        </Button>
      </div>
    </div>
  );
}

export function ReviewQueue({ articles }: { articles: NewsArticle[] }) {
  const [items, setItems] = React.useState(articles);
  const [scheduleFor, setScheduleFor] = React.useState<Record<string, Date | null>>({});
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [errorId, setErrorId] = React.useState<string | null>(null);

  React.useEffect(() => setItems(articles), [articles]);

  function updateItem(id: string, patch: Partial<NewsArticle>) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  async function handlePublishNow(article: NewsArticle) {
    setBusyId(article.id);
    await publishNowAction(article.id);
    removeItem(article.id);
    setBusyId(null);
  }

  async function handleSchedule(article: NewsArticle) {
    const date = scheduleFor[article.id];
    if (!date) {
      setErrorId(article.id);
      return;
    }
    setBusyId(article.id);
    await scheduleArticleAction(article.id, date.toISOString());
    removeItem(article.id);
    setBusyId(null);
  }

  async function handleReject(article: NewsArticle) {
    setBusyId(article.id);
    await rejectArticleAction(article.id, "نیاز به بازنویسی");
    removeItem(article.id);
    setBusyId(null);
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
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="secondary">{article.category.title}</Badge>
                <span className="text-xs text-muted-foreground">
                  {article.author.name} · {timeAgoFa(article.publishedAt)}
                </span>
              </div>
              {editingId === article.id ? (
                <EditForm
                  article={article}
                  onCancel={() => setEditingId(null)}
                  onSaved={(patch) => updateItem(article.id, patch)}
                />
              ) : (
                <>
                  <h3 className="font-bold text-foreground">{article.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.lead}</p>
                </>
              )}
            </div>
            {editingId !== article.id && (
              <Button size="sm" variant="ghost" className="shrink-0 gap-1.5" onClick={() => setEditingId(article.id)}>
                <Pencil className="h-3.5 w-3.5" />
                ویرایش
              </Button>
            )}
          </div>

          {editingId !== article.id && (
            <div className="flex flex-col gap-3 border-t border-border pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-1.5"
                  disabled={busyId === article.id}
                  onClick={() => handlePublishNow(article)}
                >
                  <Zap className="h-3.5 w-3.5" />
                  انتشار فوری
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5"
                  disabled={busyId === article.id}
                  onClick={() => handleReject(article)}
                >
                  <X className="h-3.5 w-3.5" />
                  رد کردن
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/20 bg-accent/40 p-2.5">
                <span className="text-xs font-medium text-muted-foreground">زمان‌بندی انتشار:</span>
                <JalaliDateTimePicker
                  value={scheduleFor[article.id] ?? null}
                  onChange={(date) => {
                    setScheduleFor((prev) => ({ ...prev, [article.id]: date }));
                    setErrorId(null);
                  }}
                />
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={busyId === article.id}
                  onClick={() => handleSchedule(article)}
                >
                  <Check className="h-3.5 w-3.5" />
                  تأیید و زمان‌بندی
                </Button>
              </div>
              {errorId === article.id && (
                <p className="text-xs text-destructive">ابتدا یک تاریخ و ساعت انتخاب کنید.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
