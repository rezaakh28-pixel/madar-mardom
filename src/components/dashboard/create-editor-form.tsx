"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEditorAction, type CreateEditorState } from "@/app/dashboard/admin/actions";
import { CATEGORIES } from "@/lib/mock-data";

const initialState: CreateEditorState = {};

export function CreateEditorForm() {
  const [state, formAction, pending] = useActionState(createEditorAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 sm:p-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="editor-name">نام و نام خانوادگی</Label>
        <Input id="editor-name" name="name" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="editor-username">نام کاربری</Label>
        <Input id="editor-username" name="username" dir="ltr" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="editor-email">ایمیل</Label>
        <Input id="editor-email" name="email" type="email" dir="ltr" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="editor-password">رمز عبور اولیه</Label>
        <Input id="editor-password" name="password" type="password" dir="ltr" minLength={8} required />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="editor-beat">بخش خبری</Label>
        <Select name="beatCategorySlug" defaultValue="society">
          <SelectTrigger id="editor-beat">
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

      {state.error && <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
      {state.success && <p className="text-sm text-rise sm:col-span-2">حساب سردبیر با موفقیت ساخته شد.</p>}

      <Button type="submit" disabled={pending} className="self-start sm:col-span-2">
        {pending ? "در حال ساخت…" : "ساخت حساب سردبیر"}
      </Button>
    </form>
  );
}
