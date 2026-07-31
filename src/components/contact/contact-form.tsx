"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sendContactMessageAction, type ContactFormState } from "@/app/(public)/contact/actions";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessageAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-rise/30 bg-rise/5 p-6 text-center text-sm text-foreground">
        پیام شما ارسال شد. تیم مدار مردم به‌زودی با شما در ارتباط خواهد بود.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">نام</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">ایمیل</Label>
        <Input id="email" name="email" type="email" dir="ltr" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">پیام</Label>
        <Textarea id="message" name="message" rows={6} required />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="gap-1.5 self-start">
        <Send className="h-4 w-4" />
        {pending ? "در حال ارسال…" : "ارسال پیام"}
      </Button>
    </form>
  );
}
