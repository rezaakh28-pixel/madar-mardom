"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ""} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">نام کاربری</Label>
        <Input id="username" name="username" dir="ltr" autoComplete="username" required autoFocus />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">رمز عبور</Label>
        <Input id="password" name="password" type="password" dir="ltr" autoComplete="current-password" required />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "در حال ورود…" : "ورود"}
      </Button>
    </form>
  );
}
