"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
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
  const [saving, setSaving] = React.useState(false);

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
        <Label htmlFor="edit-body">متن کامل</Label>
        <Textarea id="edit-body" rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
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
