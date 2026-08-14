"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { updateVoiceSubmissionStatus, getVoiceSubmissionById } from "@/lib/voice-store";
import { createCitizenReportArticle } from "@/lib/content";
import { logger } from "@/lib/logger";

export async function rejectVoiceSubmissionAction(id: string, note?: string) {
  const session = await requireRole("EDITOR");
  await updateVoiceSubmissionStatus(id, "REJECTED", note);
  logger.audit("voice_submission_rejected", session.user.id, { id });
  revalidatePath("/dashboard/admin/voice");
  revalidatePath("/dashboard/editor/voice");
  return { ok: true };
}

/** Marks a submission as "در حال بررسی" without publishing — optional, lightweight status update. */
export async function markVoiceSubmissionInReviewAction(id: string) {
  const session = await requireRole("EDITOR");
  await updateVoiceSubmissionStatus(id, "IN_REVIEW");
  logger.audit("voice_submission_in_review", session.user.id, { id });
  revalidatePath("/dashboard/admin/voice");
  revalidatePath("/dashboard/editor/voice");
  return { ok: true };
}

export interface ConvertVoiceSubmissionInput {
  title: string;
  deck?: string;
  lead: string;
  body: string;
  category: string;
  tags: string[];
  coverImageUrl?: string;
  coverImageOrientation?: "landscape" | "portrait";
  coverImagePosition?: string;
}

export interface ConvertVoiceSubmissionResult {
  ok: boolean;
  error?: string;
  slug?: string;
}

/**
 * Turns a citizen-submitted "صدای مردم" report into a real, published Article
 * (isCitizenReport: true) after an editor/admin has reviewed and edited it,
 * and marks the original submission as PUBLISHED. This is the one action
 * that actually produces the article shown in the homepage "گزارشات مردمی"
 * box and the /citizen-reports page — simply approving a submission never
 * publishes anything on its own.
 */
export async function convertVoiceSubmissionToArticleAction(
  id: string,
  input: ConvertVoiceSubmissionInput
): Promise<ConvertVoiceSubmissionResult> {
  const session = await requireRole("EDITOR"); // EDITOR or ADMIN (hasRole checks minimum level)

  const submission = await getVoiceSubmissionById(id);
  if (!submission) {
    return { ok: false, error: "این گزارش یافت نشد." };
  }
  if (submission.status === "PUBLISHED") {
    return { ok: false, error: "این گزارش قبلاً منتشر شده است." };
  }

  if (!input.title.trim() || !input.lead.trim() || !input.body.trim() || !input.category.trim()) {
    return { ok: false, error: "تیتر، لید، متن و دسته‌بندی نمی‌توانند خالی باشند." };
  }

  try {
    const article = await createCitizenReportArticle({
      authorId: session.user.id,
      title: input.title.trim(),
      deck: input.deck?.trim(),
      lead: input.lead.trim(),
      body: input.body.trim(),
      categorySlug: input.category,
      tags: input.tags,
      coverImageUrl: input.coverImageUrl,
      coverImageOrientation: input.coverImageOrientation,
      coverImagePosition: input.coverImagePosition,
    });

    await updateVoiceSubmissionStatus(id, "PUBLISHED");

    logger.audit("voice_submission_converted_to_article", session.user.id, {
      submissionId: id,
      articleId: article.id,
    });

    revalidatePath("/dashboard/admin/voice");
    revalidatePath("/dashboard/editor/voice");
    revalidatePath("/citizen-reports");
    revalidatePath("/", "layout");

    return { ok: true, slug: article.slug };
  } catch (err) {
    logger.error("voice_submission_convert_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "تبدیل گزارش به خبر با خطا مواجه شد." };
  }
}
