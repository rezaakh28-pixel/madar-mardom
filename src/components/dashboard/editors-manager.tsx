"use client";

import * as React from "react";
import type { User } from "@prisma/client";
import { useActionState } from "react";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BeatCheckboxGroup } from "@/components/dashboard/beat-checkbox-group";
import { updateEditorAction, deleteEditorAction, type UpdateEditorState } from "@/app/dashboard/admin/actions";
import { getCategoryBySlug } from "@/lib/mock-data";

const initialUpdateState: UpdateEditorState = {};

function EditEditorForm({ editor, onCancel }: { editor: User; onCancel: () => void }) {
  const [state, formAction, pending] = useActionState(updateEditorAction, initialUpdateState);

  React.useEffect(() => {
    if (state.success) onCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 rounded-md bg-muted/40 p-3 sm:grid-cols-2">
      <input type="hidden" name="userId" value={editor.id} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-name-${editor.id}`}>نام و نام خانوادگی</Label>
        <Input id={`edit-name-${editor.id}`} name="name" defaultValue={editor.name} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-username-${editor.id}`}>نام کاربری</Label>
        <Input id={`edit-username-${editor.id}`} name="username" dir="ltr" defaultValue={editor.username} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-email-${editor.id}`}>ایمیل</Label>
        <Input id={`edit-email-${editor.id}`} name="email" type="email" dir="ltr" defaultValue={editor.email} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-password-${editor.id}`}>رمز عبور جدید (اختیاری)</Label>
        <Input id={`edit-password-${editor.id}`} name="password" type="password" dir="ltr" minLength={8} placeholder="خالی بگذارید تا تغییر نکند" />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>بخش‌های خبری</Label>
        <BeatCheckboxGroup name="beatCategorySlugs" defaultValues={editor.beatCategorySlugs} />
      </div>

      {state.error && <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>}

      <div className="flex items-center gap-2 sm:col-span-2">
        <Button type="submit" size="sm" className="gap-1.5" disabled={pending}>
          <Save className="h-3.5 w-3.5" />
          {pending ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
          انصراف
        </Button>
      </div>
    </form>
  );
}

export function EditorsManager({ editors: initialEditors }: { editors: User[] }) {
  const [editors, setEditors] = React.useState(initialEditors);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  React.useEffect(() => setEditors(initialEditors), [initialEditors]);

  async function handleDelete(editor: User) {
    if (confirmingDeleteId !== editor.id) {
      setConfirmingDeleteId(editor.id);
      setDeleteError(null);
      return;
    }
    setBusyId(editor.id);
    const result = await deleteEditorAction(editor.id);
    if (result.ok) {
      setEditors((prev) => prev.filter((e) => e.id !== editor.id));
    } else {
      setDeleteError(result.error ?? "حذف با خطا مواجه شد.");
    }
    setBusyId(null);
    setConfirmingDeleteId(null);
  }

  if (editors.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        هنوز سردبیری ساخته نشده است.
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
      {editors.map((editor) => (
        <div key={editor.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{editor.name}</p>
              <p dir="ltr" className="text-left text-xs text-muted-foreground">
                {editor.username} · {editor.email}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {editor.beatCategorySlugs.length === 0 ? (
                  <span className="text-xs text-muted-foreground">بدون بخش خبری</span>
                ) : (
                  editor.beatCategorySlugs.map((slug) => (
                    <Badge key={slug} variant="outline">
                      {getCategoryBySlug(slug)?.title ?? slug}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {editingId !== editor.id && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditingId(editor.id)}>
                  <Pencil className="h-3.5 w-3.5" />
                  ویرایش
                </Button>
                <Button
                  size="sm"
                  variant={confirmingDeleteId === editor.id ? "destructive" : "outline"}
                  className="gap-1.5"
                  disabled={busyId === editor.id}
                  onClick={() => handleDelete(editor)}
                >
                  {confirmingDeleteId === editor.id ? <X className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                  {confirmingDeleteId === editor.id ? "تأیید حذف؟" : "حذف"}
                </Button>
              </div>
            )}
          </div>

          {editingId === editor.id && (
            <div className="mt-3">
              <EditEditorForm editor={editor} onCancel={() => setEditingId(null)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
