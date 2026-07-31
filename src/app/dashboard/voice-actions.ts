"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { updateVoiceSubmissionStatus } from "@/lib/voice-store";
import { logger } from "@/lib/logger";

export async function approveVoiceSubmissionAction(id: string) {
  const session = await requireRole("EDITOR"); // EDITOR or ADMIN (hasRole checks minimum level)
  await updateVoiceSubmissionStatus(id, "PUBLISHED");
  logger.audit("voice_submission_approved", session.user.id, { id });
  revalidatePath("/dashboard/admin/voice");
  revalidatePath("/dashboard/editor/voice");
  return { ok: true };
}

export async function rejectVoiceSubmissionAction(id: string, note?: string) {
  const session = await requireRole("EDITOR");
  await updateVoiceSubmissionStatus(id, "REJECTED", note);
  logger.audit("voice_submission_rejected", session.user.id, { id });
  revalidatePath("/dashboard/admin/voice");
  revalidatePath("/dashboard/editor/voice");
  return { ok: true };
}
