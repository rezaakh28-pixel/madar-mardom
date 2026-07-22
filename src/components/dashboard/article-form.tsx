"use client";

import * as React from "react";
import { Sparkles, Save, Send, AlertTriangle } from "lucide-react";
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
} from "@/app/(dashboard)/reporter/actions";

export function ArticleForm() {
  const [title, setTitle] = React.useState("");
  const [deck, setDeck] = React.useState("");
  const [lead, setLead] = React.useState("");
  const [body, setBody] = React.useState("");
  const [category, setCategory] = React.useState("society");
  const [tags, setTags] = React.useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = React.useState("");
  const [duplicateWarning, setDuplicateWarning] = React.useState(false);
  const [aiBusy, setAiBusy] = React.useState<string | null>(null);
  const [saveState, setSaveState] = React.useState<"idle" | "saved" | "submitted">("idle");

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
    runAi("tags", async () => setTags(await suggestTagsAction(body || lead)));

  const handleSuggestCategory = () =>
    runAi("category", async () => setCategory(await suggestCategoryAction(body || lead)));

  const handleCheckDuplicate = () =>
    runAi("duplicate", async () => setDuplicateWarning(await checkDuplicateAction(body || lead)));

  async function handleSave(action: "draft" | "submit") {
    await saveArticleAction({ title, deck, lead, body, category, tags, coverImageUrl, action });
    setSaveState(action === "draft" ? "saved" : "submitted");
    setTimeout(() => setSaveState("idle"), 3000);
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
            <div className="flex items-center justify-between">
              <Label htmlFor="body">متن کامل</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleCheckDuplicate} disabled={aiBusy === "duplicate"}>
                <Sparkles className="h-3 w-3" />
                {aiBusy === "duplicate" ? "در حال بررسی…" : "بررسی تکراری بودن خبر"}
              </Button>
            </div>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} placeholder="متن کامل خبر…" />
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
              <Label>برچسب‌ها</Label>
              <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={handleSuggestTags} disabled={aiBusy === "tags"}>
                <Sparkles className="h-3 w-3" />
                پیشنهاد
              </Button>
            </div>
            <div className="flex min-h-10 flex-wrap gap-1.5 rounded-md border border-input p-2">
              {tags.length === 0 ? (
                <span className="text-xs text-muted-foreground">برچسبی انتخاب نشده</span>
              ) : (
                tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))
              )}
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
        <Button type="button" variant="outline" className="gap-1.5" onClick={() => handleSave("draft")}>
          <Save className="h-4 w-4" />
          ذخیره پیش‌نویس
        </Button>
        <Button type="button" className="gap-1.5" onClick={() => handleSave("submit")}>
          <Send className="h-4 w-4" />
          ارسال برای سردبیر
        </Button>
        {saveState === "saved" && <span className="text-sm text-rise">پیش‌نویس ذخیره شد.</span>}
        {saveState === "submitted" && <span className="text-sm text-rise">برای سردبیر ارسال شد.</span>}
      </div>
    </div>
  );
}
