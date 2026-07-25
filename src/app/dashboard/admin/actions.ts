"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";
import { requireRole } from "@/lib/session";
import { logger } from "@/lib/logger";

export async function approveReporterAction(userId: string) {
  const admin = await requireRole("ADMIN");
  await db.user.update({ where: { id: userId }, data: { approvalStatus: "APPROVED", isActive: true } });
  logger.audit("reporter_approved", admin.user.id, { userId });
  revalidatePath("/dashboard/admin");
}

export async function rejectReporterAction(userId: string) {
  const admin = await requireRole("ADMIN");
  await db.user.update({ where: { id: userId }, data: { approvalStatus: "REJECTED", isActive: false } });
  logger.audit("reporter_rejected", admin.user.id, { userId });
  revalidatePath("/dashboard/admin");
}

export async function toggleUserActiveAction(userId: string, isActive: boolean) {
  const admin = await requireRole("ADMIN");
  await db.user.update({ where: { id: userId }, data: { isActive } });
  logger.audit("user_active_toggled", admin.user.id, { userId, isActive });
  revalidatePath("/dashboard/admin");
}

const createEditorSchema = z.object({
  name: z.string().min(2, "نام را کامل وارد کنید").max(80),
  username: z
    .string()
    .min(3, "نام کاربری باید حداقل ۳ نویسه باشد")
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، خط تیره و زیرخط باشد"),
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ نویسه باشد"),
  beatCategorySlug: z.string().min(1, "بخش خبری را انتخاب کنید"),
});

export interface CreateEditorState {
  error?: string;
  success?: boolean;
}

export async function createEditorAction(
  _prevState: CreateEditorState,
  formData: FormData
): Promise<CreateEditorState> {
  const admin = await requireRole("ADMIN");

  const parsed = createEditorSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    beatCategorySlug: formData.get("beatCategorySlug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست." };
  }

  const { name, username, email, password, beatCategorySlug } = parsed.data;

  const existing = await db.user.findFirst({ where: { OR: [{ username }, { email }] } });
  if (existing) {
    return { error: "این نام کاربری یا ایمیل قبلاً استفاده شده است." };
  }

  const passwordHash = await hashPassword(password);

  await db.user.create({
    data: {
      name,
      username,
      email,
      passwordHash,
      role: "EDITOR",
      approvalStatus: "APPROVED",
      isActive: true,
      beatCategorySlug,
    },
  });

  logger.audit("editor_created", admin.user.id, { username, beatCategorySlug });
  revalidatePath("/dashboard/admin");
  return { success: true };
}
