import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
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
//
// Images are re-encoded with sharp (Node runtime, hence the explicit
// `runtime = "nodejs"` below) before being stored:
//   - EXIF orientation is applied and stripped, so photos taken on a phone
//     held sideways/upside-down don't render rotated — a browser/Image
//     component only reads pixel data, not the EXIF rotation flag, so an
//     un-rotated upload looks "wrong" everywhere except apps that special-
//     case EXIF (like Photos on the phone that took it).
//   - HEIC/HEIF (the default format on modern iPhones) is converted to JPEG,
//     since no browser can decode/display HEIC in an <img>/Image element —
//     an uploaded HEIC cover image would previously save successfully but
//     never actually render on the site.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]);
const AV_TYPES = new Set(["video/mp4", "video/webm", "audio/mpeg", "audio/wav"]);
const ALLOWED_TYPES = new Set([...IMAGE_TYPES, ...AV_TYPES]);

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
    const isImage = IMAGE_TYPES.has(file.type);
    let body: Buffer | File = file;
    let path = `uploads/${Date.now()}-${file.name}`;
    let contentType: string | undefined;

    if (isImage && file.type !== "image/gif") {
      // GIFs are left untouched so animation survives — every browser
      // already renders them natively, so there's nothing to fix.
      const original = Buffer.from(await file.arrayBuffer());
      const pipeline = sharp(original, { failOn: "none" }).rotate(); // bakes in EXIF orientation

      if (file.type === "image/png") {
        body = await pipeline.png().toBuffer();
        contentType = "image/png";
      } else if (file.type === "image/webp") {
        body = await pipeline.webp({ quality: 90 }).toBuffer();
        contentType = "image/webp";
      } else {
        // jpeg, heic, heif, or anything else sharp can read — normalize to
        // a plain, universally-supported JPEG.
        body = await pipeline.jpeg({ quality: 88 }).toBuffer();
        contentType = "image/jpeg";
      }
      path = `uploads/${Date.now()}-${file.name.replace(/\.[^./]+$/, "")}.${contentType.split("/")[1]}`;
    }

    const blob = await put(path, body, {
      access: "public",
      addRandomSuffix: true,
      ...(contentType && { contentType }),
    });

    logger.audit("file_uploaded", "anonymous", { url: blob.url, size: file.size, type: file.type });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (err) {
    logger.error("upload_failed", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "آپلود با خطا مواجه شد. لطفاً فرمت دیگری از تصویر را امتحان کنید." }, { status: 500 });
  }
}
