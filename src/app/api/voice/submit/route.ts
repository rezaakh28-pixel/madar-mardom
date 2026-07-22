import { NextResponse } from "next/server";
import { z } from "zod";
import { createVoiceSubmission } from "@/lib/voice-store";
import { logger } from "@/lib/logger";

const submissionSchema = z.object({
  kind: z.enum(["NEWS_TIP", "PHOTO", "VIDEO", "REPORT"]),
  title: z.string().min(5, "عنوان باید حداقل ۵ نویسه باشد").max(150),
  description: z.string().min(20, "توضیحات باید حداقل ۲۰ نویسه باشد").max(4000),
  category: z.string(),
  location: z.string().optional(),
  fileUrls: z.array(z.string().url()).max(6).optional(),
  // Placeholder captcha token — validate against a real provider (e.g. Cloudflare Turnstile) in production.
  captchaToken: z.string().min(1, "لطفاً کپچا را تکمیل کنید"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "اطلاعات ارسالی نامعتبر است.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // TODO: verify parsed.data.captchaToken with the real captcha provider before proceeding.

  const submission = createVoiceSubmission({
    kind: parsed.data.kind,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category as never,
    location: parsed.data.location,
    fileUrls: parsed.data.fileUrls,
  });

  logger.audit("voice_submission_created", "anonymous", { trackingCode: submission.trackingCode });

  return NextResponse.json({ trackingCode: submission.trackingCode }, { status: 201 });
}
