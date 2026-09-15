"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, ImagePlus, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/shared/file-upload";
import { CoverImagePositionPicker } from "@/components/dashboard/cover-image-position-picker";
import { CATEGORIES } from "@/lib/mock-data";
import { updatePublishedArticleAction } from "@/app/dashboard/articles-actions";

export interface PublishedArticleEditable {
  id: string;
  title: string;
  deck?: string;
  lead: string;
  body: string;
  categorySlug: string;
  coverImageUrl?: string;
  coverImageOrientation?: "landscape" | "portrait";
  coverImagePosition?: string;
  videoUrl?: string;
}

export function PublishedArticleEditForm({
  article,
  returnPath,
}: {
  article: PublishedArticleEditable;
  returnPath: string;
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState(article.title);
  const [deck, setDeck] = React.useState(article.deck ?? "");
  const [lead, setLead] = React.useState(article.lead);
  const [body, setBody] = React.useState(article.body);
  const [categorySlug, setCategorySlug] = React.useState(article.categorySlug);
  const [coverImageUrl, setCoverImageUrl] = React.useState(article.coverImageUrl ?? "");
  const [coverOrientation, setCoverOrientation] = React.useState<"landscape" | "portrait">(
    article.coverImageOrientation ?? "landscape"
  );
  const [coverPosition, setCoverPosition] = React.useState(article.coverImagePosition ?? "center");
  const [mainVideoUrl, setMainVideoUrl] = React.useState(article.videoUrl ?? "");
  const [saving, setSaving] = React.useState(false);

  const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const [insertingImage, setInsertingImage] = React.useState(false);
  const [insertError, setInsertError] = React.useState<string | null>(null);
  const [videoUrlInput, setVideoUrlInput] = React.useState("");
  const [showVideoInput, setShowVideoInput] = React.useState(false);

  async function handleInsertImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInsertingImage(true);
    setInsertError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "آپلود با خطا مواجه شد.");

      const marker = `\n\n![تصویر](${data.url})\n\n`;
      const textarea = bodyRef.current;
      const start = textarea?.selectionStart ?? body.length;
      const end = textarea?.selectionEnd ?? body.length;
      const next = body.slice(0, start) + marker + body.slice(end);
      setBody(next);

      requestAnimationFrame(() => {
        if (!textarea) return;
        textarea.focus();
        const pos = start + marker.length;
        textarea.setSelectionRange(pos, pos);
      });
    } catch (err) {
      setInsertError(err instanceof Error ? err.message : "آپلود تصویر با خطا مواجه شد.");
    } finally {
      setInsertingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  function handleInsertVideo() {
    const trimmed = videoUrlInput.trim();
    if (!trimmed) return;

    const marker = `\n\n[video](${trimmed})\n\n`;
    const textarea = bodyRef.current;
    const start = textarea?.selectionStart ?? body.length;
    const end = textarea?.selectionEnd ?? body.length;
    const next = body.slice(0, start) + marker + body.slice(end);
    setBody(next);

    setVideoUrlInput("");
    setShowVideoInput(false);

    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      const pos = start + marker.length;
      textarea.setSelectionRange(pos, pos);
    });
  }

  async function handleSave() {
    setSaving(true);
    await updatePublishedArticleAction(article.id, {
      title,
      deck,
      lead,
      body,
      categorySlug,
      coverImageUrl,
      coverImageOrientation: coverOrientation,
      coverImagePosition: coverPosition,
      videoUrl: mainVideoUrl.trim(),
    });
    setSaving(false);
    router.push(returnPath);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-title">تیتر</Label>
        <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-deck">روتیتر</Label>
        <Input id="edit-deck" value={deck} onChange={(e) => setDeck(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-lead">لید</Label>
        <Textarea id="edit-lead" rows={3} value={lead} onChange={(e) => setLead(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="edit-body">متن کامل</Label>
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInsertImageFile}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => imageInputRef.current?.click()}
              disabled={insertingImage}
            >
              <ImagePlus className="h-3 w-3" />
              {insertingImage ? "در حال آپلود…" : "درج تصویر در متن"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setShowVideoInput((v) => !v)}
            >
              <Film className="h-3 w-3" />
              درج ویدیو در متن
            </Button>
          </div>
        </div>
        {showVideoInput && (
          <div className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-accent/40 p-2">
            <Input
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              placeholder="لینک ویدیو از یوتیوب، آپارات یا هر سایت دیگر"
              dir="ltr"
              className="h-8 text-sm"
            />
            <Button type="button" size="sm" className="h-8 shrink-0" onClick={handleInsertVideo} disabled={!videoUrlInput.trim()}>
              درج
            </Button>
          </div>
        )}
        {insertError && <p className="text-xs text-destructive">{insertError}</p>}
        <Textarea ref={bodyRef} id="edit-body" rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
        <p className="text-xs text-muted-foreground">
          برای درج تصویر یا ویدیو داخل متن، مکان‌نما را در نقطه‌ی مدنظر بگذارید و روی دکمه‌ی مربوطه بزنید — دقیقاً همان‌جا در صفحه‌ی خبر نمایش داده می‌شود.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-category">دسته‌بندی</Label>
        <Select value={categorySlug} onValueChange={setCategorySlug}>
          <SelectTrigger id="edit-category" className="w-56">
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

      {categorySlug === "video" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-main-video-url">لینک ویدیوی اصلی</Label>
          <Input
            id="edit-main-video-url"
            dir="ltr"
            value={mainVideoUrl}
            onChange={(e) => setMainVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... یا لینک آپارات/فایل مستقیم"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>تصویر شاخص</Label>
        <FileUpload
          mode="single"
          accept="image/*"
          label="برای تغییر تصویر، یک فایل جدید انتخاب کنید"
          hint="حداکثر ۸ مگابایت"
          onChange={(urls) => setCoverImageUrl(urls[0] ?? "")}
        />
        {coverImageUrl && (
          <div className="mt-2 flex flex-col gap-2 rounded-md border border-border p-3">
            <div
              className={`relative w-full overflow-hidden rounded-md bg-muted ${coverOrientation === "portrait" ? "aspect-[4/5]" : "aspect-[16/9]"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt="پیش‌نمایش تصویر شاخص"
                className="h-full w-full object-cover"
                style={{ objectPosition: coverPosition }}
              />
            </div>
            <CoverImagePositionPicker
              orientation={coverOrientation}
              position={coverPosition}
              onOrientationChange={setCoverOrientation}
              onPositionChange={setCoverPosition}
            />
          </div>
        )}
      </div>

      <Button type="button" className="gap-1.5 self-start" disabled={saving} onClick={handleSave}>
        <Save className="h-4 w-4" />
        {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
      </Button>
    </div>
  );
}
