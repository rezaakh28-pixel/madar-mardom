import type { UserRole } from "@/types";

// ---------------------------------------------------------------------------
// Auth / RBAC layer — client-safe half.
//
// This file must stay importable from Client Components (the dashboard
// sidebar and user table both use `hasRole()` / `ROLE_LABELS_FA`), so it
// must never import `next/headers` or anything else server-only. The
// session reader that needs `next/headers` lives in `src/lib/session.ts`.
//
// This is a DEMO session, not real authentication — see the comments in
// `src/lib/session.ts` and `src/app/login/` for how it works and what to
// replace with real accounts.
// ---------------------------------------------------------------------------

export interface Session {
  user: {
    id: string;
    name: string;
    username: string;
    role: UserRole;
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
