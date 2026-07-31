import { db } from "@/lib/db";
import type { VoiceSubmission, VoiceSubmissionKind, VoiceSubmissionStatus, CategorySlug } from "@/types";

// ---------------------------------------------------------------------------
// Real, database-backed "صدای مردم" (Voice of People) submissions.
// ---------------------------------------------------------------------------

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "MM-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

interface VoiceSubmissionRow {
  trackingCode: string;
  kind: string;
  title: string;
  description: string;
  categorySlug: string;
  location: string | null;
  fileUrls: string[];
  status: string;
  submittedAt: Date;
  statusNote: string | null;
}

function mapSubmission(row: VoiceSubmissionRow): VoiceSubmission {
  return {
    trackingCode: row.trackingCode,
    kind: row.kind as VoiceSubmissionKind,
    title: row.title,
    description: row.description,
    category: row.categorySlug as CategorySlug,
    location: row.location ?? undefined,
    fileUrls: row.fileUrls,
    status: row.status as VoiceSubmissionStatus,
    submittedAt: row.submittedAt.toISOString(),
    statusNote: row.statusNote ?? undefined,
  };
}

export interface CreateVoiceSubmissionInput {
  kind: VoiceSubmissionKind;
  title: string;
  description: string;
  category: CategorySlug;
  location?: string;
  fileUrls?: string[];
}

export async function createVoiceSubmission(input: CreateVoiceSubmissionInput): Promise<VoiceSubmission> {
  let trackingCode = generateTrackingCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.voiceSubmission.findUnique({ where: { trackingCode } });
    if (!existing) break;
    trackingCode = generateTrackingCode();
  }

  const row = await db.voiceSubmission.create({
    data: {
      trackingCode,
      kind: input.kind,
      title: input.title,
      description: input.description,
      categorySlug: input.category,
      location: input.location,
      fileUrls: input.fileUrls ?? [],
    },
  });
  return mapSubmission(row);
}

export async function getVoiceSubmissionByCode(code: string): Promise<VoiceSubmission | null> {
  const row = await db.voiceSubmission.findUnique({ where: { trackingCode: code.trim().toUpperCase() } });
  return row ? mapSubmission(row) : null;
}

/** Admin/editor moderation list — returns raw rows (with real `id`s) rather than the public shape. */
export async function listVoiceSubmissions() {
  return db.voiceSubmission.findMany({ orderBy: { submittedAt: "desc" } });
}

export async function updateVoiceSubmissionStatus(
  id: string,
  status: "IN_REVIEW" | "PUBLISHED" | "REJECTED",
  note?: string
) {
  return db.voiceSubmission.update({ where: { id }, data: { status, statusNote: note || null } });
}
