"use client";

import { useActionState } from "react";
import { registerReporterAction, type RegisterState } from "@/app/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerReporterAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">نام و نام خانوادگی</Label>
        <Input id="name" name="name" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">نام کاربری</Label>
        <Input id="username" name="username" dir="ltr" autoComplete="username" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">ایمیل</Label>
        <Input id="email" name="email" type="email" dir="ltr" autoComplete="email" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">رمز عبور</Label>
        <Input
          id="password"
          name="password"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "در حال ارسال…" : "ارسال درخواست ثبت‌نام"}
      </Button>
    </form>
  );
}
