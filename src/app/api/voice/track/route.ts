import { NextResponse } from "next/server";
import { getVoiceSubmissionByCode } from "@/lib/voice-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "کد رهگیری الزامی است." }, { status: 400 });
  }

  let submission;
  try {
    submission = await getVoiceSubmissionByCode(code);
  } catch {
    return NextResponse.json({ error: "اتصال به پایگاه‌داده برقرار نیست." }, { status: 500 });
  }

  if (!submission) {
    return NextResponse.json({ error: "کد رهگیری یافت نشد." }, { status: 404 });
  }

  return NextResponse.json(submission);
}
