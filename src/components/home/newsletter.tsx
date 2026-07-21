"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "success">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !consent) return;
    // TODO: POST to /api/newsletter once the backend endpoint exists.
    setStatus("success");
  }

  return (
    <section className="rounded-xl bg-primary p-6 text-primary-foreground sm:p-8">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
        <Mail className="h-8 w-8 text-secondary" />
        <h2 className="text-xl font-extrabold">خبرنامه مدار مردم</h2>
        <p className="text-sm text-primary-foreground/75">
          هر هفته، مهم‌ترین گزارش‌ها و تحلیل‌های مدار مردم را در ایمیل خود دریافت کنید.
        </p>

        {status === "success" ? (
          <p className="rounded-md bg-white/10 px-4 py-3 text-sm text-secondary">
            عضویت شما ثبت شد. لطفاً ایمیل خود را برای تأیید بررسی کنید.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full flex-col items-stretch gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              آدرس ایمیل
            </label>
            <Input
              id="newsletter-email"
              type="email"
              required
              placeholder="آدرس ایمیل شما"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white text-foreground"
              dir="ltr"
            />
            <Button type="submit" variant="secondary" className="shrink-0">
              عضویت
            </Button>
          </form>
        )}

        <label className="flex items-center gap-2 text-xs text-primary-foreground/70">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-white/30 bg-transparent"
          />
          موافقم که مدار مردم برایم ایمیل خبرنامه ارسال کند.
        </label>
      </div>
    </section>
  );
}
