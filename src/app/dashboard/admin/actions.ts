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
  revalidatePath("/dashboard/admin/reporters");
}

export async function rejectReporterAction(userId: string) {
  const admin = await requireRole("ADMIN");
  await db.user.update({ where: { id: userId }, data: { approvalStatus: "REJECTED", isActive: false } });
  logger.audit("reporter_rejected", admin.user.id, { userId });
  revalidatePath("/dashboard/admin/reporters");
}

export async function toggleUserActiveAction(userId: string, isActive: boolean) {
  const admin = await requireRole("ADMIN");
  await db.user.update({ where: { id: userId }, data: { isActive } });
  logger.audit("user_active_toggled", admin.user.id, { userId, isActive });
  revalidatePath("/dashboard/admin/reporters");
}

export async function deleteReporterAction(userId: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireRole("ADMIN");
  try {
    const { count } = await db.user.deleteMany({ where: { id: userId, role: "REPORTER" } });
    if (count > 0) {
      logger.audit("reporter_deleted", admin.user.id, { userId });
      revalidatePath("/dashboard/admin/reporters");
    }
    return { ok: count > 0 };
  } catch (err) {
    logger.error("reporter_delete_failed", { message: err instanceof Error ? err.message : String(err) });
    return {
      ok: false,
      error: "حذف با خطا مواجه شد — این کاربر خبرهایی در سایت دارد. می‌توانید به‌جای حذف، غیرفعالش کنید.",
    };
  }
}

const editorBaseSchema = {
  name: z.string().min(2, "نام را کامل وارد کنید").max(80),
  username: z
    .string()
    .min(3, "نام کاربری باید حداقل ۳ نویسه باشد")
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، خط تیره و زیرخط باشد"),
  email: z.string().email("ایمیل معتبر نیست"),
  beatCategorySlugs: z.array(z.string()).min(1, "حداقل یک بخش خبری را انتخاب کنید"),
};

const createEditorSchema = z.object({
  ...editorBaseSchema,
  password: z.string().min(8, "رمز عبور باید حداقل ۸ نویسه باشد"),
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
    beatCategorySlugs: formData.getAll("beatCategorySlugs"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست." };
  }

  const { name, username, email, password, beatCategorySlugs } = parsed.data;

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
      beatCategorySlugs,
    },
  });

  logger.audit("editor_created", admin.user.id, { username, beatCategorySlugs });
  revalidatePath("/dashboard/admin/editors");
  return { success: true };
}

const updateEditorSchema = z.object({
  userId: z.string().min(1),
  ...editorBaseSchema,
  password: z.union([z.string().min(8, "رمز عبور باید حداقل ۸ نویسه باشد"), z.literal("")]),
});

export interface UpdateEditorState {
  error?: string;
  success?: boolean;
}

export async function updateEditorAction(
  _prevState: UpdateEditorState,
  formData: FormData
): Promise<UpdateEditorState> {
  const admin = await requireRole("ADMIN");

  const parsed = updateEditorSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password") ?? "",
    beatCategorySlugs: formData.getAll("beatCategorySlugs"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست." };
  }

  const { userId, name, username, email, password, beatCategorySlugs } = parsed.data;

  const existing = await db.user.findFirst({
    where: { AND: [{ OR: [{ username }, { email }] }, { id: { not: userId } }] },
  });
  if (existing) {
    return { error: "این نام کاربری یا ایمیل قبلاً برای کاربر دیگری استفاده شده است." };
  }

  try {
    await db.user.update({
      where: { id: userId, role: "EDITOR" },
      data: {
        name,
        username,
        email,
        beatCategorySlugs,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
    });
  } catch {
    return { error: "این کاربر یافت نشد یا سردبیر نیست." };
  }

  logger.audit("editor_updated", admin.user.id, { userId, beatCategorySlugs });
  revalidatePath("/dashboard/admin/editors");
  return { success: true };
}

export async function deleteEditorAction(userId: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireRole("ADMIN");
  try {
    const { count } = await db.user.deleteMany({ where: { id: userId, role: "EDITOR" } });
    if (count > 0) {
      logger.audit("editor_deleted", admin.user.id, { userId });
      revalidatePath("/dashboard/admin/editors");
    }
    return { ok: count > 0 };
  } catch (err) {
    logger.error("editor_delete_failed", { message: err instanceof Error ? err.message : String(err) });
    return {
      ok: false,
      error: "حذف با خطا مواجه شد — این کاربر ممکن است به محتوای دیگری مرتبط باشد. می‌توانید به‌جای حذف، غیرفعالش کنید.",
    };
  }
}
