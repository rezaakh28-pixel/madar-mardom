import { cookies } from "next/headers";
import type { UserRole } from "@/types";

// ---------------------------------------------------------------------------
// Auth / RBAC layer.
//
// This is a DEMO session, not real authentication: `getSession()` reads the
// `mm_role` cookie set by the demo login page (`src/app/login`) — there is
// no password check or user database behind it, so anyone can "log in" as
// any role. It exists so the dashboard UI and RBAC gate have something real
// to read while the rest of the app is built.
//
// To wire up real accounts later:
//   1. `npm i next-auth`
//   2. Add `src/app/api/auth/[...nextauth]/route.ts` with a Credentials (or
//      OAuth) provider that checks against the `User` model in
//      prisma/schema.prisma (the `passwordHash` field is already there).
//   3. Replace the body of `getSession()` below with NextAuth's `auth()`.
//   4. Replace the cookie check in `src/middleware.ts` with NextAuth's
//      `getToken()` / `withAuth`.
// Every call site already awaits `getSession()`, so the swap is contained
// to this file plus the middleware.
// ---------------------------------------------------------------------------

export interface Session {
  user: {
    id: string;
    name: string;
    username: string;
    role: UserRole;
  };
}

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

const ROLE_RANK: Record<UserRole, number> = {
  REPORTER: 1,
  EDITOR: 2,
  ADMIN: 3,
};

/** True if `role` has at least the privilege level of `minimumRole`. */
export function hasRole(role: UserRole, minimumRole: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimumRole];
}

export const ROLE_LABELS_FA: Record<UserRole, string> = {
  REPORTER: "خبرنگار",
  EDITOR: "سردبیر",
  ADMIN: "مدیر",
};

const ROLE_RANK: Record<UserRole, number> = {
  REPORTER: 1,
  EDITOR: 2,
  ADMIN: 3,
};

/** True if `role` has at least the privilege level of `minimumRole`. */
export function hasRole(role: UserRole, minimumRole: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimumRole];
}

export const ROLE_LABELS_FA: Record<UserRole, string> = {
  REPORTER: "خبرنگار",
  EDITOR: "سردبیر",
  ADMIN: "مدیر",
};
