import type { UserRole } from "@/types";

// ---------------------------------------------------------------------------
// Auth / RBAC layer — client-safe half.
//
// This file must stay importable from Client Components (the dashboard
// sidebar and user table both use `hasRole()` / `ROLE_LABELS_FA`), so it
// must never import `next/headers` or anything else server-only. The
// session reader that needs `next/headers` lives in `src/lib/session.ts`.
//
// Real accounts, password hashing, and an admin-approval flow for reporter
// registration are wired up — see `src/app/login/`, `src/app/register/`,
// and `src/lib/session.ts` for how sessions are issued and verified.
// ---------------------------------------------------------------------------

export interface Session {
  user: {
    id: string;
    name: string;
    username: string;
    role: UserRole;
    beatCategorySlug?: string;
  };
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
