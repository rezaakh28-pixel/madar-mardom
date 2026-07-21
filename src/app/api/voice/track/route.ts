import { NextResponse } from "next/server";
import { getVoiceSubmissionByCode } from "@/lib/voice-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "کد رهگیری الزامی است." }, { status: 400 });
  }

  const submission = getVoiceSubmissionByCode(code);
  if (!submission) {
    return NextResponse.json({ error: "کد رهگیری یافت نشد." }, { status: 404 });
  }

  return NextResponse.json(submission);
}
