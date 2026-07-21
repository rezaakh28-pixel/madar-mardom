"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: POST to a real /api/contact route once the backend endpoint exists.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-rise/30 bg-rise/5 p-6 text-center text-sm text-foreground">
        پیام شما ارسال شد. تیم مدار مردم به‌زودی با شما در ارتباط خواهد بود.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
      <Button type="submit" className="gap-1.5 self-start">
        <Send className="h-4 w-4" />
        ارسال پیام
      </Button>
    </form>
  );
}
