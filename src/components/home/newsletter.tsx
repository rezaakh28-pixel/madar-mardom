"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletterAction, type NewsletterState } from "@/app/(public)/newsletter-actions";

const initialState: NewsletterState = {};

export function Newsletter() {
  const [state, formAction, pending] = useActionState(subscribeNewsletterAction, initialState);

  return (
    <section className="rounded-xl bg-primary p-6 text-primary-foreground sm:p-8">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
        <Mail className="h-8 w-8 text-secondary" />
        <h2 className="text-xl font-extrabold">خبرنامه مدار مردم</h2>
        <p className="text-sm text-primary-foreground/75">
          هر هفته، مهم‌ترین گزارش‌ها و تحلیل‌های مدار مردم را در ایمیل خود دریافت کنید.
        </p>

        {state.success ? (
          <p className="rounded-md bg-white/10 px-4 py-3 text-sm text-secondary">
            عضویت شما با موفقیت ثبت شد.
          </p>
        ) : (
          <form action={formAction} className="flex w-full flex-col items-stretch gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              آدرس ایمیل
            </label>
            <Input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="آدرس ایمیل شما"
              className="bg-white text-foreground"
              dir="ltr"
            />
            <Button type="submit" variant="secondary" className="shrink-0" disabled={pending}>
              {pending ? "در حال ثبت…" : "عضویت"}
            </Button>
          </form>
        )}

        {state.error && <p className="text-xs text-secondary">{state.error}</p>}

        {!state.success && (
          <p className="text-xs text-primary-foreground/60">با عضویت، موافقت خود را با دریافت ایمیل خبرنامه اعلام می‌کنید.</p>
        )}
      </div>
    </section>
  );
}
