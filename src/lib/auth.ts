import type { UserRole } from "@/types";

// ---------------------------------------------------------------------------
// Auth / RBAC layer.
//
// For now this returns a mock session so dashboard UIs can be built and
// demoed without a real login flow. To wire up NextAuth later:
//   1. `npm i next-auth`
//   2. Add `src/app/api/auth/[...nextauth]/route.ts` with your provider(s).
//   3. Replace `getSession()` below with `auth()` from your NextAuth config.
// Every call site already awaits `getSession()`, so the swap is contained
// to this file.
// ---------------------------------------------------------------------------

export interface Session {
  user: {
    id: string;
    name: string;
    username: string;
    role: UserRole;
  };
}

const MOCK_SESSION: Session = {
  user: {
    id: "usr_demo_editor",
    name: "کاربر نمایشی",
    username: "demo-user",
    role: "ADMIN", // change to "REPORTER" | "EDITOR" to preview other panels
  },
};

export async function getSession(): Promise<Session | null> {
  return MOCK_SESSION;
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
