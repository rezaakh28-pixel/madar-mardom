"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/passwords";
import { signSession } from "@/lib/signed-cookie";
import { logger } from "@/lib/logger";

const loginSchema = z.object({
  username: z.string().min(1, "نام کاربری را وارد کنید"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
  next: z.string().optional(),
});

export interface LoginState {
  error?: string;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    next: formData.get("next")?.toString() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست." };
  }

  const { username, password, next } = parsed.data;

  let user;
  try {
    user = await db.user.findUnique({ where: { username } });
  } catch (err) {
    logger.error("login_db_unreachable", { message: err instanceof Error ? err.message : String(err) });
    return { error: "اتصال به پایگاه‌داده برقرار نیست. اگر شما مدیر سایت هستید، بخش راه‌اندازی دیتابیس را در README بررسی کنید." };
  }

  if (!user) {
    return { error: "نام کاربری یا رمز عبور اشتباه است." };
  }

  if (user.approvalStatus === "PENDING") {
    return { error: "حساب شما هنوز توسط مدیر تأیید نشده است." };
  }

  if (user.approvalStatus === "REJECTED" || !user.isActive) {
    return { error: "این حساب غیرفعال است." };
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return { error: "نام کاربری یا رمز عبور اشتباه است." };
  }

  const token = await signSession({
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    beatCategorySlugs: user.beatCategorySlugs,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8 hours
  });

  const cookieStore = await cookies();
  cookieStore.set("mm_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  logger.audit("login", user.id, { username: user.username, role: user.role });

  redirect(next && next.startsWith("/dashboard") ? next : `/dashboard/${user.role.toLowerCase()}`);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("mm_session");
  redirect("/");
}
