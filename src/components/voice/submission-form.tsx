"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/shared/file-upload";
import { TurnstileWidget } from "@/components/shared/turnstile-widget";
import { CATEGORIES } from "@/lib/mock-data";
import type { VoiceSubmissionKind } from "@/types";

const KIND_OPTIONS: Array<{ value: VoiceSubmissionKind; label: string }> = [
  { value: "NEWS_TIP", label: "خبر" },
  { value: "PHOTO", label: "عکس" },
  { value: "VIDEO", label: "ویدیو" },
  { value: "REPORT", label: "گزارش" },
];

export function SubmissionForm() {
  const [kind, setKind] = React.useState<VoiceSubmissionKind>("NEWS_TIP");
  const [category, setCategory] = React.useState<string>("society");
  const [fileUrls, setFileUrls] = React.useState<string[]>([]);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = React.useState(0);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [trackingCode, setTrackingCode] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError("لطفاً کپچا را تکمیل کنید.");
      return;
    }

    const form = new FormData(e.currentTarget);
    setStatus("submitting");

    try {
      const res = await fetch("/api/voice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title: form.get("title"),
          description: form.get("description"),
          category,
          location: form.get("location") || undefined,
          fileUrls: fileUrls.length > 0 ? fileUrls : undefined,
          captchaToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "خطایی رخ داد.");

      setTrackingCode(data.trackingCode);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد.");
      setStatus("error");
      setCaptchaToken(null);
      setCaptchaKey((k) => k + 1); // remount the widget so the person gets a fresh, unused token
    }
  }

  if (status === "success" && trackingCode) {
    return (
      <div className="rounded-lg border border-rise/30 bg-rise/5 p-6 text-center">
        <p className="mb-2 font-semibold text-foreground">گزارش شما ثبت شد.</p>
        <p className="mb-4 text-sm text-muted-foreground">
          کد رهگیری خود را یادداشت کنید تا بتوانید وضعیت آن را پیگیری کنید.
        </p>
        <p className="font-numeral inline-block rounded-md bg-card px-4 py-2 text-lg font-extrabold tracking-wider text-primary">
          {trackingCode}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {KIND_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setKind(option.value)}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              kind === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:bg-accent"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">عنوان</Label>
        <Input id="title" name="title" required minLength={5} placeholder="خلاصه‌ای از موضوع" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">توضیحات</Label>
        <Textarea id="description" name="description" required minLength={20} rows={5} placeholder="ماجرا را با جزئیات شرح دهید…" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">دسته‌بندی</Label>
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
          <Label htmlFor="location">موقعیت مکانی (اختیاری)</Label>
          <Input id="location" name="location" placeholder="شهر یا استان" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>فایل ضمیمه (اختیاری)</Label>
        <FileUpload
          mode="multiple"
          accept="image/*,video/*"
          label="فایل را اینجا رها کنید یا برای انتخاب کلیک کنید"
          hint="عکس یا ویدیو — حداکثر ۸ مگابایت"
          onChange={setFileUrls}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>تأیید امنیتی</Label>
        <TurnstileWidget
          key={captchaKey}
          onVerify={setCaptchaToken}
          onExpire={() => setCaptchaToken(null)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={status === "submitting"} className="self-start">
        {status === "submitting" ? "در حال ارسال…" : "ارسال گزارش"}
      </Button>
    </form>
  );
}
