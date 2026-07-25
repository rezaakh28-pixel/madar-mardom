"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";
import { logger } from "@/lib/logger";

const registerSchema = z.object({
  name: z.string().min(2, "نام را کامل وارد کنید").max(80),
  username: z
    .string()
    .min(3, "نام کاربری باید حداقل ۳ نویسه باشد")
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، خط تیره و زیرخط باشد"),
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ نویسه باشد"),
});

export interface RegisterState {
  error?: string;
}

export async function registerReporterAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست." };
  }

  const { name, username, email, password } = parsed.data;

  let existing;
  try {
    existing = await db.user.findFirst({ where: { OR: [{ username }, { email }] } });
  } catch (err) {
    logger.error("register_db_unreachable", { message: err instanceof Error ? err.message : String(err) });
    return { error: "اتصال به پایگاه‌داده برقرار نیست. لطفاً بعداً دوباره تلاش کنید." };
  }

  if (existing) {
    return { error: "این نام کاربری یا ایمیل قبلاً ثبت شده است." };
  }

  const passwordHash = await hashPassword(password);

  try {
    await db.user.create({
      data: {
        name,
        username,
        email,
        passwordHash,
        role: "REPORTER",
        approvalStatus: "PENDING",
        isActive: false,
      },
    });
  } catch (err) {
    logger.error("register_create_failed", { message: err instanceof Error ? err.message : String(err) });
    return { error: "ثبت‌نام با خطا مواجه شد. لطفاً دوباره تلاش کنید." };
  }

  logger.audit("reporter_registered", username, { email });

  redirect("/register/submitted");
}
