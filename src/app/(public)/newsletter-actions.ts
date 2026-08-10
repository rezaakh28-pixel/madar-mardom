"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

const subscribeSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
});

export interface NewsletterState {
  error?: string;
  success?: boolean;
}

export async function subscribeNewsletterAction(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const parsed = subscribeSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ایمیل معتبر نیست." };
  }

  try {
    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: {},
      create: { email: parsed.data.email },
    });
    logger.audit("newsletter_subscribed", "anonymous", { email: parsed.data.email });
    return { success: true };
  } catch (err) {
    logger.error("newsletter_subscribe_failed", { message: err instanceof Error ? err.message : String(err) });
    return { error: "عضویت با خطا مواجه شد. لطفاً بعداً دوباره تلاش کنید." };
  }
}
