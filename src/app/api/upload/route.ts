import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Real file upload endpoint, backed by Vercel Blob.
//
// Setup required on Vercel (one-time, no code changes needed):
//   1. Project dashboard -> Storage tab -> Create Database -> Blob.
//   2. Connect it to this project. Vercel automatically adds the
//      BLOB_READ_WRITE_TOKEN environment variable and redeploys.
// Until that's done, this route responds with a clear 500 instead of a
// confusing crash, so the rest of the app keeps working.
// ---------------------------------------------------------------------------

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
]);

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "سرویس آپلود هنوز وصل نشده. باید یک Blob store روی Vercel بسازید و به این پروژه وصل کنید (Storage → Create Database → Blob).",
      },
      { status: 500 }
    );
  }

  const ip = getClientIp(request);
  const rate = checkRateLimit({ key: `upload:${ip}`, limit: 20, windowMs: 10 * 60 * 1000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "تعداد آپلودهای شما بیش از حد مجاز است." }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "فایلی ارسال نشده است." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "نوع فایل مجاز نیست." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "حجم فایل بیش از ۸ مگابایت است." }, { status: 400 });
  }

  try {
    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    logger.audit("file_uploaded", "anonymous", { url: blob.url, size: file.size, type: file.type });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (err) {
    logger.error("upload_failed", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "آپلود با خطا مواجه شد." }, { status: 500 });
  }
}
