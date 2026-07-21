import type { VoiceSubmission, VoiceSubmissionKind, CategorySlug } from "@/types";

// ---------------------------------------------------------------------------
// In-memory store standing in for the `VoiceSubmission` Prisma model.
// Swap each function body for a `db.voiceSubmission.*` call once the DB is
// connected — signatures are designed to match 1:1.
// ---------------------------------------------------------------------------

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "MM-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const submissions = new Map<string, VoiceSubmission>();

// Seed a couple of demo entries so the tracking UI has something to show out of the box.
submissions.set("MM-DEMO12", {
  trackingCode: "MM-DEMO12",
  kind: "REPORT",
  title: "کمبود آب شرب در روستای نمونه",
  description: "گزارش مردمی درباره قطعی مکرر آب در یکی از روستاهای حاشیه شهر.",
  category: "provinces",
  location: "خوزستان",
  status: "IN_REVIEW",
  submittedAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
  statusNote: "گزارش شما توسط دبیر بخش استان‌ها در حال بررسی است.",
});

export interface CreateVoiceSubmissionInput {
  kind: VoiceSubmissionKind;
  title: string;
  description: string;
  category: CategorySlug;
  location?: string;
}

export function createVoiceSubmission(input: CreateVoiceSubmissionInput): VoiceSubmission {
  const submission: VoiceSubmission = {
    ...input,
    trackingCode: generateTrackingCode(),
    status: "SUBMITTED",
    submittedAt: new Date().toISOString(),
  };
  submissions.set(submission.trackingCode, submission);
  return submission;
}

export function getVoiceSubmissionByCode(code: string): VoiceSubmission | null {
  return submissions.get(code.trim().toUpperCase()) ?? null;
}
