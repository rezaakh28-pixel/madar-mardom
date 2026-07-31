"use client";

import * as React from "react";
import { Check, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { approveVoiceSubmissionAction, rejectVoiceSubmissionAction } from "@/app/dashboard/voice-actions";
import { getCategoryBySlug } from "@/lib/mock-data";
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

export function VoiceModerationQueue({ items }: { items: VoiceModerationItem[] }) {
  const [list, setList] = React.useState(items);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function handleApprove(id: string) {
    setBusyId(id);
    await approveVoiceSubmissionAction(id);
    setList((prev) => prev.filter((i) => i.id !== id));
    setBusyId(null);
  }

  async function handleReject(id: string) {
    setBusyId(id);
    await rejectVoiceSubmissionAction(id, "بررسی و رد شد");
    setList((prev) => prev.filter((i) => i.id !== id));
    setBusyId(null);
  }

  if (list.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        گزارش جدیدی در انتظار بررسی نیست.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {list.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{KIND_LABEL_FA[item.kind] ?? item.kind}</Badge>
            <Badge variant="outline">{getCategoryBySlug(item.categorySlug)?.title ?? item.categorySlug}</Badge>
            <span className="font-numeral text-xs text-muted-foreground" dir="ltr">
              {item.trackingCode}
            </span>
            <span className="text-xs text-muted-foreground">· {timeAgoFa(item.submittedAt)}</span>
          </div>

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
                  className="text-xs text-primary hover:underline"
                >
                  مشاهده پیوست
                </a>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <Button size="sm" className="gap-1.5" disabled={busyId === item.id} onClick={() => handleApprove(item.id)}>
              <Check className="h-3.5 w-3.5" />
              تأیید
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
        </div>
      ))}
    </div>
  );
}
