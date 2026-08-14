"use client";

import * as React from "react";
import { Check, X, MapPin, Newspaper, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/shared/file-upload";
import { CoverImagePositionPicker } from "@/components/dashboard/cover-image-position-picker";
import {
  convertVoiceSubmissionToArticleAction,
  rejectVoiceSubmissionAction,
} from "@/app/dashboard/voice-actions";
import { CATEGORIES, getCategoryBySlug } from "@/lib/mock-data";
import { timeAgoFa } from "@/lib/utils";

export interface VoiceModerationItem {
  id: string;
  trackingCode: string;
  kind: string;
  title: string;
  description: string;
  categorySlug: string;
  location: string | null;
  fileUrls: string[];
  status: string;
  submittedAt: string;
}

const KIND_LABEL_FA: Record<string, string> = {
  NEWS_TIP: "خبر",
  PHOTO: "عکس",
  VIDEO: "ویدیو",
  REPORT: "گزارش",
};

function isImageUrl(url: string) {
  return /\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(url);
}

function ConvertForm({
  item,
  onCancel,
  onPublished,
}: {
  item: VoiceModerationItem;
  onCancel: () => void;
  onPublished: (id: string) => void;
}) {
  const [title, setTitle] = React.useState(item.title);
  const [deck, setDeck] = React.useState("");
  const [lead, setLead] = React.useState(item.description.slice(0, 220));
  const [body, setBody] = React.useState(item.description);
  const [category, setCategory] = React.useState(item.categorySlug);
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");
  const [coverImageUrl, setCoverImageUrl] = React.useState("");
  const [coverOrientation, setCoverOrientation] = React.useState<"landscape" | "portrait">("landscape");
  const [coverPosition, setCoverPosition] = React.useState("center");
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function addTagFromInput() {
    const clean = tagInput.trim().replace(/^#+/, "").replace(/\s+/g, "-");
    if (!clean || tags.length >= 3 || tags.includes(clean)) return;
    setTags((prev) => [...prev, clean]);
    setTagInput("");
  }

  function handleTagInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTagFromInput();
    }
  }

  async function handlePublish() {
    if (!title.trim() || !lead.trim() || !body.trim()) {
      setError("تیتر، لید و متن نمی‌توانند خالی باشند.");
      return;
    }
    setPublishing(true);
    setError(null);

    const result = await convertVoiceSubmissionToArticleAction(item.id, {
      title,
      deck: deck || undefined,
      lead,
      body,
      category,
      tags,
      coverImageUrl: coverImageUrl || undefined,
      coverImageOrientation: coverOrientation,
      coverImagePosition: coverPosition,
    });

    setPublishing(false);

    if (!result.ok) {
      setError(result.error ?? "تبدیل گزارش به خبر با خطا مواجه شد.");
      return;
    }

    onPublished(item.id);
  }

  return (
    <div className="flex flex-col gap-4 rounded-md bg-muted/40 p-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`vc-title-${item.id}`}>تیتر خبر</Label>
        <Input id={`vc-title-${item.id}`} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`vc-deck-${item.id}`}>روتیتر</Label>
        <Input
          id={`vc-deck-${item.id}`}
          value={deck}
          onChange={(e) => setDeck(e.target.value)}
          placeholder="روتیتر (اختیاری)"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`vc-lead-${item.id}`}>لید</Label>
        <Textarea id={`vc-lead-${item.id}`} rows={3} value={lead} onChange={(e) => setLead(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`vc-body-${item.id}`}>متن کامل</Label>
        <Textarea id={`vc-body-${item.id}`} rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
        <p className="text-xs text-muted-foreground">
          متن ارسالی مردم به‌عنوان پیش‌نویس در این کادر قرار گرفته — پیش از انتشار آن را ویرایش و کامل کنید.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`vc-category-${item.id}`}>دسته‌بندی</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id={`vc-category-${item.id}`} className="w-56">
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`vc-tag-${item.id}`}>برچسب‌ها (حداکثر ۳ هشتگ)</Label>
        <div className="flex min-h-10 flex-wrap gap-1.5 rounded-md border border-input p-2">
          {tags.length === 0 ? (
            <span className="text-xs text-muted-foreground">برچسبی اضافه نشده</span>
          ) : (
            tags.map((tag) => (
              <Badge key={tag} variant="outline" className="gap-1">
                #{tag}
                <button
                  type="button"
                  onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  aria-label={`حذف برچسب ${tag}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            id={`vc-tag-${item.id}`}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder={tags.length >= 3 ? "حداکثر تعداد برچسب رسیده" : "برچسب را بنویسید و Enter بزنید"}
            disabled={tags.length >= 3}
            className="h-8 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0"
            onClick={addTagFromInput}
            disabled={tags.length >= 3 || !tagInput.trim()}
          >
            افزودن
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>تصویر شاخص</Label>

        {item.fileUrls.filter(isImageUrl).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.fileUrls.filter(isImageUrl).map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setCoverImageUrl(url)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                  coverImageUrl === url ? "border-primary" : "border-border hover:border-primary/50"
                }`}
                title="استفاده از این پیوست به‌عنوان تصویر شاخص"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="پیوست ارسالی" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <FileUpload
          mode="single"
          accept="image/*"
          label="یا یک تصویر جدید آپلود کنید"
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

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-2 border-t border-border pt-3">
        <Button type="button" size="sm" className="gap-1.5" disabled={publishing} onClick={handlePublish}>
          <Check className="h-3.5 w-3.5" />
          {publishing ? "در حال انتشار…" : "انتشار به‌عنوان گزارش مردمی"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={publishing}>
          انصراف
        </Button>
      </div>
    </div>
  );
}

export function VoiceModerationQueue({ items }: { items: VoiceModerationItem[] }) {
  const [list, setList] = React.useState(items);
  const [convertingId, setConvertingId] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [publishedNotice, setPublishedNotice] = React.useState(false);

  React.useEffect(() => setList(items), [items]);

  function handlePublished(id: string) {
    setList((prev) => prev.filter((i) => i.id !== id));
    setConvertingId(null);
    setPublishedNotice(true);
  }

  async function handleReject(id: string) {
    setBusyId(id);
    await rejectVoiceSubmissionAction(id, "بررسی و رد شد");
    setList((prev) => prev.filter((i) => i.id !== id));
    setBusyId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {publishedNotice && (
        <p className="flex items-center gap-1.5 rounded-md border border-rise/30 bg-rise/5 p-3 text-sm text-rise">
          <Newspaper className="h-4 w-4" />
          گزارش به‌عنوان «گزارش مردمی» منتشر شد و اکنون در صفحه اصلی و بخش گزارش‌های مردمی قابل مشاهده است.
        </p>
      )}

      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          گزارش جدیدی در انتظار بررسی نیست.
        </p>
      ) : (
        list.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{KIND_LABEL_FA[item.kind] ?? item.kind}</Badge>
              <Badge variant="outline">{getCategoryBySlug(item.categorySlug)?.title ?? item.categorySlug}</Badge>
              <span className="font-numeral text-xs text-muted-foreground" dir="ltr">
                {item.trackingCode}
              </span>
              <span className="text-xs text-muted-foreground">· {timeAgoFa(item.submittedAt)}</span>
            </div>

            {convertingId === item.id ? (
              <ConvertForm
                item={item}
                onCancel={() => setConvertingId(null)}
                onPublished={handlePublished}
              />
            ) : (
              <>
                <h3 className="font-bold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>

                {item.location && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </p>
                )}

                {item.fileUrls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.fileUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        مشاهده پیوست
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={busyId === item.id}
                    onClick={() => setConvertingId(item.id)}
                  >
                    <Newspaper className="h-3.5 w-3.5" />
                    تبدیل به خبر و انتشار
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1.5"
                    disabled={busyId === item.id}
                    onClick={() => handleReject(item.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                    رد کردن
                  </Button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
