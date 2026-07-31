"use client";

import * as React from "react";
import type { User } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleUserActiveAction, deleteReporterAction } from "@/app/dashboard/admin/actions";
import { formatFa, formatJalali } from "@/lib/utils";

export interface ReporterWithActivity extends User {
  activity: {
    draftCount: number;
    pendingCount: number;
    publishedCount: number;
    rejectedCount: number;
  };
}

export function ReportersList({ reporters: initial }: { reporters: ReporterWithActivity[] }) {
  const [reporters, setReporters] = React.useState(initial);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  async function handleToggleActive(reporter: ReporterWithActivity) {
    const next = !reporter.isActive;
    setBusyId(reporter.id);
    setReporters((prev) => prev.map((r) => (r.id === reporter.id ? { ...r, isActive: next } : r)));
    await toggleUserActiveAction(reporter.id, next);
    setBusyId(null);
  }

  async function handleDelete(reporter: ReporterWithActivity) {
    if (confirmId !== reporter.id) {
      setConfirmId(reporter.id);
      setDeleteError(null);
      return;
    }
    setBusyId(reporter.id);
    const result = await deleteReporterAction(reporter.id);
    if (result.ok) {
      setReporters((prev) => prev.filter((r) => r.id !== reporter.id));
    } else {
      setDeleteError(result.error ?? "حذف با خطا مواجه شد.");
    }
    setBusyId(null);
    setConfirmId(null);
  }

  if (reporters.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        هنوز خبرنگاری تأیید نشده است.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {deleteError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {deleteError}
        </p>
      )}
      {reporters.map((reporter) => (
        <div key={reporter.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="font-bold text-foreground">{reporter.name}</span>
              <Badge variant={reporter.isActive ? "success" : "muted"}>{reporter.isActive ? "فعال" : "غیرفعال"}</Badge>
            </div>
            <p dir="ltr" className="text-left text-xs text-muted-foreground">
              {reporter.username} · {reporter.email}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">عضویت از {formatJalali(reporter.createdAt)}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="outline">{formatFa(reporter.activity.publishedCount)} منتشرشده</Badge>
              <Badge variant="outline">{formatFa(reporter.activity.pendingCount)} در انتظار</Badge>
              <Badge variant="outline">{formatFa(reporter.activity.draftCount)} پیش‌نویس</Badge>
              <Badge variant="outline">{formatFa(reporter.activity.rejectedCount)} ردشده</Badge>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="outline" disabled={busyId === reporter.id} onClick={() => handleToggleActive(reporter)}>
              {reporter.isActive ? "غیرفعال کردن" : "فعال کردن"}
            </Button>
            <Button
              size="sm"
              variant={confirmId === reporter.id ? "destructive" : "ghost"}
              className="gap-1.5"
              disabled={busyId === reporter.id}
              onClick={() => handleDelete(reporter)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmId === reporter.id ? "مطمئنید؟" : "حذف"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
