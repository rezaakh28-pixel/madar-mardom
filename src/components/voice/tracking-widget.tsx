"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { VoiceSubmission, VoiceSubmissionStatus } from "@/types";
import { formatJalali } from "@/lib/utils";

const STATUS_LABEL_FA: Record<VoiceSubmissionStatus, string> = {
  SUBMITTED: "ثبت‌شده",
  IN_REVIEW: "در حال بررسی",
  PUBLISHED: "منتشرشده",
  REJECTED: "رد شده",
  ARCHIVED: "بایگانی‌شده",
};

const STATUS_VARIANT: Record<VoiceSubmissionStatus, "muted" | "secondary" | "success" | "danger"> = {
  SUBMITTED: "muted",
  IN_REVIEW: "secondary",
  PUBLISHED: "success",
  REJECTED: "danger",
  ARCHIVED: "muted",
};

export function TrackingWidget() {
  const [code, setCode] = React.useState("");
  const [result, setResult] = React.useState<VoiceSubmission | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/voice/track?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "خطایی رخ داد.");
      setResult(data as VoiceSubmission);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="کد رهگیری (مثال: MM-DEMO12)"
          className="font-numeral"
          dir="ltr"
        />
        <Button type="submit" disabled={loading} className="shrink-0 gap-1.5">
          <Search className="h-4 w-4" />
          پیگیری
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{result.title}</h3>
            <Badge variant={STATUS_VARIANT[result.status]}>{STATUS_LABEL_FA[result.status]}</Badge>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">{result.description}</p>
          {result.statusNote && (
            <p className="mb-2 rounded-md bg-muted/50 p-3 text-sm text-foreground">{result.statusNote}</p>
          )}
          <p className="text-xs text-muted-foreground">تاریخ ثبت: {formatJalali(result.submittedAt)}</p>
        </div>
      )}
    </div>
  );
}
