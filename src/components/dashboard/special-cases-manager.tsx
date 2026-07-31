"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/shared/file-upload";
import {
  createSpecialCaseAction,
  deleteSpecialCaseAction,
  type SpecialCaseFormState,
} from "@/app/dashboard/special-case-actions";
import { formatJalali } from "@/lib/utils";

export interface SpecialCaseItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  createdAt: string;
  articleCount: number;
}

const initialState: SpecialCaseFormState = {};

export function SpecialCasesManager({ cases, basePath }: { cases: SpecialCaseItem[]; basePath: string }) {
  const [state, formAction, pending] = useActionState(createSpecialCaseAction, initialState);
  const [items, setItems] = React.useState(cases);
  const [coverImageUrl, setCoverImageUrl] = React.useState("");
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => setItems(cases), [cases]);

  async function handleDelete(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setBusyId(id);
    await deleteSpecialCaseAction(id);
    setItems((prev) => prev.filter((c) => c.id !== id));
    setBusyId(null);
    setConfirmId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-foreground">پرونده ویژه جدید</h3>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sc-title">عنوان</Label>
          <Input id="sc-title" name="title" required placeholder="مثلاً بودجه ۱۴۰۵" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sc-summary">توضیح کوتاه</Label>
          <Textarea id="sc-summary" name="summary" rows={2} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>تصویر جلد</Label>
          <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
          <FileUpload mode="single" accept="image/*" label="تصویر جلد پرونده" onChange={(urls) => setCoverImageUrl(urls[0] ?? "")} />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.success && <p className="text-sm text-rise">پرونده ویژه ساخته شد.</p>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "در حال ساخت…" : "ساخت پرونده"}
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            هنوز پرونده ویژه‌ای ساخته نشده است.
          </p>
        ) : (
          items.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
              <div>
                <p className="font-bold text-foreground">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {c.articleCount} خبر · {formatJalali(c.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" className="gap-1.5" asChild>
                  <Link href={`${basePath}/${c.id}`}>
                    <FolderOpen className="h-3.5 w-3.5" />
                    مدیریت اخبار
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant={confirmId === c.id ? "destructive" : "ghost"}
                  className="gap-1.5"
                  disabled={busyId === c.id}
                  onClick={() => handleDelete(c.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {confirmId === c.id ? "مطمئنید؟" : "حذف"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
