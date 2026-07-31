"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createContactMessage } from "@/lib/contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const contactSchema = z.object({
  name: z.string().min(2, "نام را کامل وارد کنید").max(80),
  email: z.string().email("ایمیل معتبر نیست"),
  message: z.string().min(10, "پیام باید حداقل ۱۰ نویسه باشد").max(4000),
});

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

export async function sendContactMessageAction(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerList.get("x-real-ip") ?? "unknown";
  const rate = checkRateLimit({ key: `contact:${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rate.allowed) {
    return { error: "تعداد پیام‌های شما بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست." };
  }

  try {
    await createContactMessage(parsed.data);
    logger.audit("contact_message_sent", "anonymous", { email: parsed.data.email });
    return { success: true };
  } catch (err) {
    logger.error("contact_message_failed", { message: err instanceof Error ? err.message : String(err) });
    return { error: "ارسال پیام با خطا مواجه شد. لطفاً بعداً دوباره تلاش کنید." };
  }
}
