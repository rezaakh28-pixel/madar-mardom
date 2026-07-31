"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteDraftAction } from "@/app/dashboard/reporter/actions";
import { timeAgoFa } from "@/lib/utils";
import type { ArticleStatus } from "@/types";

export interface DraftListItem {
  id: string;
  title: string;
  categoryTitle: string;
  status: ArticleStatus;
  updatedAt: string;
  reviewNote?: string | null;
}

const STATUS_LABEL_FA: Record<ArticleStatus, string> = {
  DRAFT: "پیش‌نویس",
  PENDING_REVIEW: "در انتظار بررسی سردبیر",
  PUBLISHED: "منتشرشده",
  REJECTED: "ردشده",
  ARCHIVED: "بایگانی‌شده",
};

const STATUS_VARIANT: Record<ArticleStatus, "muted" | "secondary" | "success" | "danger"> = {
  DRAFT: "muted",
  PENDING_REVIEW: "secondary",
  PUBLISHED: "success",
  REJECTED: "danger",
  ARCHIVED: "muted",
};

export function DraftsList({ drafts }: { drafts: DraftListItem[] }) {
  const [items, setItems] = React.useState(drafts);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setBusyId(id);
    await deleteDraftAction(id);
    setItems((prev) => prev.filter((d) => d.id !== id));
    setBusyId(null);
    setConfirmId(null);
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        هنوز پیش‌نویسی ندارید.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((draft) => (
        <div key={draft.id} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[draft.status]}>{STATUS_LABEL_FA[draft.status]}</Badge>
              <span className="text-xs text-muted-foreground">{draft.categoryTitle}</span>
              <span className="text-xs text-muted-foreground">· {timeAgoFa(draft.updatedAt)}</span>
            </div>
            <h3 className="font-bold text-foreground">{draft.title || "(بدون تیتر)"}</h3>
            {draft.status === "REJECTED" && draft.reviewNote && (
              <p className="mt-1 text-xs text-destructive">دلیل رد: {draft.reviewNote}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href={`/dashboard/reporter/drafts/${draft.id}`}>
                <Pencil className="h-3.5 w-3.5" />
                ویرایش
              </Link>
            </Button>
            <Button
              size="sm"
              variant={confirmId === draft.id ? "destructive" : "ghost"}
              className="gap-1.5"
              disabled={busyId === draft.id}
              onClick={() => handleDelete(draft.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmId === draft.id ? "مطمئنید؟ دوباره بزنید" : "حذف"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
