"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Save, Send, AlertTriangle, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/shared/file-upload";
import { CATEGORIES } from "@/lib/mock-data";
import {
  suggestTitleAction,
  suggestTagsAction,
  suggestCategoryAction,
  checkDuplicateAction,
  saveArticleAction,
  updateDraftAction,
} from "@/app/dashboard/reporter/actions";

export interface EditableArticle {
  id: string;
  title: string;
  deck?: string;
  lead: string;
  body: string;
  category: string;
  tags: string[];
  coverImageUrl?: string;
}

export function ArticleForm({ initialArticle }: { initialArticle?: EditableArticle }) {
  const router = useRouter();
  const isEditMode = Boolean(initialArticle);

  const [title, setTitle] = React.useState(initialArticle?.title ?? "");
  const [deck, setDeck] = React.useState(initialArticle?.deck ?? "");
  const [lead, setLead] = React.useState(initialArticle?.lead ?? "");
  const [body, setBody] = React.useState(initialArticle?.body ?? "");
  const [category, setCategory] = React.useState(initialArticle?.category ?? "society");
  const [tags, setTags] = React.useState<string[]>(initialArticle?.tags ?? []);
  const [tagInput, setTagInput] = React.useState("");
  const [coverImageUrl, setCoverImageUrl] = React.useState(initialArticle?.coverImageUrl ?? "");
  const [duplicateWarning, setDuplicateWarning] = React.useState(false);
  const [aiBusy, setAiBusy] = React.useState<string | null>(null);
  const [saveState, setSaveState] = React.useState<"idle" | "saved" | "submitted">("idle");
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const [insertingImage, setInsertingImage] = React.useState(false);

  async function runAi(task: string, fn: () => Promise<void>) {
    setAiBusy(task);
    try {
      await fn();
    } finally {
      setAiBusy(null);
    }
  }

  const handleSuggestTitle = () =>
    runAi("title", async () => setTitle(await suggestTitleAction(body || lead)));

  const handleSuggestTags = () =>
    runAi("tags", async () => setTags((await suggestTagsAction(body || lead)).slice(0, 3)));

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

  const handleSuggestCategory = () =>
    runAi("category", async () => setCategory(await suggestCategoryAction(body || lead)));

  const handleCheckDuplicate = () =>
    runAi("duplicate", async () => setDuplicateWarning(await checkDuplicateAction(body || lead)));

  async function handleInsertImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInsertingImage(true);
    setSaveError(null);

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
      setSaveError(err instanceof Error ? err.message : "آپلود تصویر با خطا مواجه شد.");
    } finally {
      setInsertingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function handleSave(action: "draft" | "submit") {
    setSaving(true);
    setSaveError(null);

    const result = isEditMode
      ? await updateDraftAction(initialArticle!.id, { title, deck, lead, body, category, tags, coverImageUrl, action })
      : await saveArticleAction({ title, deck, lead, body, category, tags, coverImageUrl, action });

    setSaving(false);

    if (!result.ok) {
      setSaveError(result.error ?? "ذخیره خبر با خطا مواجه شد.");
      return;
    }

    if (isEditMode) {
      router.push("/dashboard/reporter/drafts");
      router.refresh();
      return;
    }

    setSaveState(action === "draft" ? "saved" : "submitted");
    setTitle("");
    setDeck("");
    setLead("");
    setBody("");
    setTags([]);
    setTagInput("");
    setCoverImageUrl("");
    setDuplicateWarning(false);
    setTimeout(() => setSaveState("idle"), 4000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">تیتر</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleSuggestTitle} disabled={aiBusy === "title"}>
                <Sparkles className="h-3 w-3" />
                {aiBusy === "title" ? "در حال پیشنهاد…" : "پیشنهاد تیتر با هوش مصنوعی"}
              </Button>
            </div>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="تیتر خبر" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deck">روتیتر</Label>
            <Input id="deck" value={deck} onChange={(e) => setDeck(e.target.value)} placeholder="روتیتر (اختیاری)" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead">لید</Label>
            <Textarea id="lead" value={lead} onChange={(e) => setLead(e.target.value)} rows={3} placeholder="پاراگراف آغازین خبر" />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="body">متن کامل</Label>
              <div className="flex items-center gap-1.5">
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
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleCheckDuplicate} disabled={aiBusy === "duplicate"}>
                  <Sparkles className="h-3 w-3" />
                  {aiBusy === "duplicate" ? "در حال بررسی…" : "بررسی تکراری بودن خبر"}
                </Button>
              </div>
            </div>
            <Textarea ref={bodyRef} id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={12} placeholder="متن کامل خبر…" />
            <p className="text-xs text-muted-foreground">
              برای درج تصویر داخل متن، مکان‌نما را در نقطه‌ی مدنظر بگذارید و روی «درج تصویر در متن» بزنید — تصویر دقیقاً همان‌جا در صفحه‌ی خبر نمایش داده می‌شود.
            </p>
            {duplicateWarning && (
              <p className="flex items-center gap-1.5 text-xs text-secondary">
                <AlertTriangle className="h-3.5 w-3.5" />
                خبری مشابه این متن پیش‌تر منتشر شده است. لطفاً بررسی کنید.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">دسته‌بندی</Label>
              <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={handleSuggestCategory} disabled={aiBusy === "category"}>
                <Sparkles className="h-3 w-3" />
                پیشنهاد
              </Button>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="tag-input">برچسب‌ها (حداکثر ۳ هشتگ)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 gap-1 text-xs"
                onClick={handleSuggestTags}
                disabled={aiBusy === "tags" || tags.length >= 3}
              >
                <Sparkles className="h-3 w-3" />
                پیشنهاد
              </Button>
            </div>
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
                id="tag-input"
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
            <FileUpload
              mode="single"
              accept="image/*"
              label="تصویر را اینجا رها کنید یا برای انتخاب کلیک کنید"
              hint="حداکثر ۸ مگابایت"
              onChange={(urls) => setCoverImageUrl(urls[0] ?? "")}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" className="gap-1.5" disabled={saving} onClick={() => handleSave("draft")}>
          <Save className="h-4 w-4" />
          ذخیره پیش‌نویس
        </Button>
        <Button type="button" className="gap-1.5" disabled={saving} onClick={() => handleSave("submit")}>
          <Send className="h-4 w-4" />
          ارسال برای سردبیر
        </Button>
        {saveState === "saved" && <span className="text-sm text-rise">پیش‌نویس ذخیره شد.</span>}
        {saveState === "submitted" && <span className="text-sm text-rise">برای سردبیر ارسال شد.</span>}
        {saveError && <span className="text-sm text-destructive">{saveError}</span>}
      </div>
    </div>
  );
}
