"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, Trash2, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/shared/file-upload";
import {
  createAdAction,
  toggleAdActiveAction,
  deleteAdAction,
  reorderAdAction,
} from "@/app/dashboard/admin/ads-actions";
import type { AdBanner } from "@/lib/ads";

export function AdsManager({ ads: initialAds }: { ads: AdBanner[] }) {
  const [ads, setAds] = React.useState(initialAds);
  const [title, setTitle] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => setAds(initialAds), [initialAds]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !imageUrl || !linkUrl.trim()) {
      setError("عنوان، تصویر و لینک الزامی هستند.");
      return;
    }

    setCreating(true);
    const result = await createAdAction({ title, imageUrl, linkUrl });
    setCreating(false);

    if (!result.ok) {
      setError(result.error ?? "افزودن تبلیغ با خطا مواجه شد.");
      return;
    }

    setTitle("");
    setLinkUrl("");
    setImageUrl("");
  }

  async function handleToggle(ad: AdBanner) {
    setBusyId(ad.id);
    setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, isActive: !a.isActive } : a)));
    await toggleAdActiveAction(ad.id, !ad.isActive);
    setBusyId(null);
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    await deleteAdAction(id);
    setAds((prev) => prev.filter((a) => a.id !== id));
    setBusyId(null);
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    setBusyId(id);
    const index = ads.findIndex((a) => a.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index !== -1 && swapIndex >= 0 && swapIndex < ads.length) {
      setAds((prev) => {
        const next = [...prev];
        [next[index], next[swapIndex]] = [next[swapIndex]!, next[index]!];
        return next;
      });
    }
    await reorderAdAction(id, direction);
    setBusyId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleCreate} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-bold text-foreground">افزودن تبلیغ جدید</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ad-title">عنوان (داخلی)</Label>
            <Input
              id="ad-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: تبلیغ فروشگاه X"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ad-link">لینک مقصد</Label>
            <Input
              id="ad-link"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>تصویر بنر</Label>
          {imageUrl ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="پیش‌نمایش بنر" className="h-20 w-auto rounded-md border border-border" />
              <Button type="button" variant="outline" size="sm" onClick={() => setImageUrl("")}>
                تغییر تصویر
              </Button>
            </div>
          ) : (
            <FileUpload
              mode="single"
              accept="image/*"
              label="تصویر بنر را اینجا رها کنید یا برای انتخاب کلیک کنید"
              hint="هر اندازه‌ای مجاز است — تصویر با عرض کامل باکس نمایش داده می‌شود"
              onChange={(urls) => setImageUrl(urls[0] ?? "")}
            />
          )}
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button type="submit" className="w-fit gap-1.5" disabled={creating}>
          <Plus className="h-4 w-4" />
          {creating ? "در حال افزودن…" : "افزودن تبلیغ"}
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        {ads.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            هنوز تبلیغی اضافه نشده است.
          </p>
        ) : (
          ads.map((ad, index) => (
            <div key={ad.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ad.imageUrl} alt={ad.title} className="h-16 w-24 shrink-0 rounded-md border border-border object-cover" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{ad.title}</p>
                <a
                  href={ad.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 truncate text-xs text-primary hover:underline"
                  dir="ltr"
                >
                  {ad.linkUrl}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={busyId === ad.id || index === 0}
                  onClick={() => handleReorder(ad.id, "up")}
                  aria-label="جابه‌جایی به بالا"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={busyId === ad.id || index === ads.length - 1}
                  onClick={() => handleReorder(ad.id, "down")}
                  aria-label="جابه‌جایی به پایین"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant={ad.isActive ? "secondary" : "outline"}
                  size="sm"
                  disabled={busyId === ad.id}
                  onClick={() => handleToggle(ad)}
                >
                  {ad.isActive ? "فعال" : "غیرفعال"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  disabled={busyId === ad.id}
                  onClick={() => handleDelete(ad.id)}
                  aria-label="حذف تبلیغ"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
