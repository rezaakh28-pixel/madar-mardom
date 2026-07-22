"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// DEMO login only — there is no password or user table check here. This
// exists so the RBAC-gated dashboards have a real (if minimal) way to set
// the `mm_role` cookie that `src/middleware.ts` and `src/lib/auth.ts` read.
// Replace with real NextAuth sign-in once accounts are wired up.
// ---------------------------------------------------------------------------

async function loginAs(role: UserRole, next: string | null) {
  const cookieStore = await cookies();
  cookieStore.set("mm_role", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  logger.audit("demo_login", `demo-${role.toLowerCase()}`, { role });
  redirect(next && next.startsWith("/dashboard") ? next : `/dashboard/${role.toLowerCase()}`);
}

export async function loginAsReporterAction(formData: FormData) {
  await loginAs("REPORTER", formData.get("next")?.toString() || null);
}

export async function loginAsEditorAction(formData: FormData) {
  await loginAs("EDITOR", formData.get("next")?.toString() || null);
}

export async function loginAsAdminAction(formData: FormData) {
  await loginAs("ADMIN", formData.get("next")?.toString() || null);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("mm_role");
  redirect("/");
}
