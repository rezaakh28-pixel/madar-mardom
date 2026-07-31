"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import {
  createSpecialCase,
  updateSpecialCase,
  deleteSpecialCase,
  assignArticleToSpecialCase,
  type CreateSpecialCaseInput,
} from "@/lib/content";
import { logger } from "@/lib/logger";

export interface SpecialCaseFormState {
  error?: string;
  success?: boolean;
}

export async function createSpecialCaseAction(
  _prev: SpecialCaseFormState,
  formData: FormData
): Promise<SpecialCaseFormState> {
  const session = await requireRole("EDITOR");
  const title = formData.get("title")?.toString().trim();
  const summary = formData.get("summary")?.toString().trim();
  const coverImageUrl = formData.get("coverImageUrl")?.toString().trim();

  if (!title || !summary) {
    return { error: "عنوان و توضیح پرونده الزامی است." };
  }

  await createSpecialCase({ title, summary, coverImageUrl });
  logger.audit("special_case_created", session.user.id, { title });
  revalidatePath("/dashboard/admin/special-cases");
  revalidatePath("/dashboard/editor/special-cases");
  revalidatePath("/special-cases");
  return { success: true };
}

export async function updateSpecialCaseAction(id: string, input: CreateSpecialCaseInput) {
  const session = await requireRole("EDITOR");
  await updateSpecialCase(id, input);
  logger.audit("special_case_updated", session.user.id, { id });
  revalidatePath("/special-cases");
  return { ok: true };
}

export async function deleteSpecialCaseAction(id: string) {
  const session = await requireRole("EDITOR");
  await deleteSpecialCase(id);
  logger.audit("special_case_deleted", session.user.id, { id });
  revalidatePath("/dashboard/admin/special-cases");
  revalidatePath("/dashboard/editor/special-cases");
  revalidatePath("/special-cases");
  return { ok: true };
}

export async function assignArticleToCaseAction(articleId: string, specialCaseId: string | null) {
  const session = await requireRole("EDITOR");
  await assignArticleToSpecialCase(articleId, specialCaseId);
  logger.audit("article_assigned_to_case", session.user.id, { articleId, specialCaseId });
  revalidatePath("/dashboard/admin/special-cases");
  revalidatePath("/dashboard/editor/special-cases");
  revalidatePath("/special-cases");
  return { ok: true };
}
