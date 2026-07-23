import { cookies } from "next/headers";
import type { UserRole } from "@/types";
import type { Session } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Server-only session reader.
//
// Reads the `mm_role` cookie set by the demo login page (`src/app/login`).
// This uses `next/headers`, so it can only be imported from Server
// Components, Route Handlers, or Server Actions — never from a file marked
// "use client" (importing it there breaks the client bundle, since
// `next/headers` has no browser equivalent).
//
// There is no password check or user database behind this — anyone can
// "log in" as any role. To wire up real accounts later:
//   1. `npm i next-auth`
//   2. Add `src/app/api/auth/[...nextauth]/route.ts` with a Credentials (or
//      OAuth) provider that checks against the `User` model in
//      prisma/schema.prisma (the `passwordHash` field is already there).
//   3. Replace the body of `getSession()` below with NextAuth's `auth()`.
//   4. Replace the cookie check in `src/middleware.ts` with NextAuth's
//      `getToken()` / `withAuth`.
// ---------------------------------------------------------------------------

const DEMO_USERS: Record<UserRole, Session["user"]> = {
  REPORTER: { id: "usr_demo_reporter", name: "کاربر نمایشی (خبرنگار)", username: "demo-reporter", role: "REPORTER" },
  EDITOR: { id: "usr_demo_editor", name: "کاربر نمایشی (سردبیر)", username: "demo-editor", role: "EDITOR" },
  ADMIN: { id: "usr_demo_admin", name: "کاربر نمایشی (مدیر)", username: "demo-admin", role: "ADMIN" },
};

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get("mm_role")?.value as UserRole | undefined;
  if (!role || !(role in DEMO_USERS)) return null;
  return { user: DEMO_USERS[role] };
}
