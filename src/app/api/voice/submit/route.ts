import { NextResponse } from "next/server";
import { z } from "zod";
import { createVoiceSubmission } from "@/lib/voice-store";
import { getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const submissionSchema = z.object({
  kind: z.enum(["NEWS_TIP", "PHOTO", "VIDEO", "REPORT"]),
  title: z.string().min(5, "عنوان باید حداقل ۵ نویسه باشد").max(150),
  description: z.string().min(20, "توضیحات باید حداقل ۲۰ نویسه باشد").max(4000),
  category: z.string(),
  location: z.string().optional(),
  fileUrls: z.array(z.string().url()).max(6).optional(),
  captchaToken: z.string().min(1, "لطفاً کپچا را تکمیل کنید"),
});

/** Verifies a Cloudflare Turnstile token server-side — the client-side widget callback firing is never trusted on its own. */
async function verifyTurnstileToken(token: string, remoteIp: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    logger.error("turnstile_secret_missing", {});
    return false;
  }

  try {
    const params = new URLSearchParams({ secret, response: token });
    if (remoteIp !== "unknown") params.set("remoteip", remoteIp);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = (await res.json()) as { success?: boolean };
    return data?.success === true;
  } catch (err) {
    logger.error("turnstile_verify_failed", { message: err instanceof Error ? err.message : String(err) });
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "اطلاعات ارسالی نامعتبر است.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const captchaOk = await verifyTurnstileToken(parsed.data.captchaToken, getClientIp(request));
  if (!captchaOk) {
    return NextResponse.json({ error: "تأیید کپچا ناموفق بود. لطفاً دوباره تلاش کنید." }, { status: 400 });
  }

  try {
    const submission = await createVoiceSubmission({
      kind: parsed.data.kind,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category as never,
      location: parsed.data.location,
      fileUrls: parsed.data.fileUrls,
    });

    logger.audit("voice_submission_created", "anonymous", { trackingCode: submission.trackingCode });

    return NextResponse.json({ trackingCode: submission.trackingCode }, { status: 201 });
  } catch (err) {
    logger.error("voice_submission_failed", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "ارسال گزارش با خطا مواجه شد. لطفاً بعداً دوباره تلاش کنید." }, { status: 500 });
  }
}
