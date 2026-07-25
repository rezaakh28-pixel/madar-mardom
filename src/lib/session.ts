import { cookies } from "next/headers";
import type { Session } from "@/lib/auth";
import { hasRole } from "@/lib/auth";
import type { UserRole } from "@/types";
import { verifySession } from "@/lib/signed-cookie";

// ---------------------------------------------------------------------------
// Server-only session reader.
//
// Reads and verifies the signed `mm_session` cookie set by `/login` (see
// `src/app/login/actions.ts`). This uses `next/headers`, so it can only be
// imported from Server Components, Route Handlers, or Server Actions — never
// from a file marked "use client" (importing it there breaks the client
// bundle, since `next/headers` has no browser equivalent). The client-safe
// half of the auth layer (`hasRole`, `ROLE_LABELS_FA`) lives in
// `src/lib/auth.ts`.
//
// Real accounts, password hashing, and an admin-approval flow for reporter
// registration are wired up (see `src/app/login/`, `src/app/register/`, and
// the User model in prisma/schema.prisma). To move to NextAuth later:
//   1. `npm i next-auth`
//   2. Add `src/app/api/auth/[...nextauth]/route.ts` with a Credentials
//      provider backed by the same `User` model.
//   3. Replace the body of `getSession()` below with NextAuth's `auth()`.
//   4. Replace the cookie check in `src/middleware.ts` with NextAuth's
//      `getToken()` / `withAuth`.
// ---------------------------------------------------------------------------

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("mm_session")?.value;
  const payload = await verifySession(token);
  if (!payload) return null;

  return {
    user: {
      id: payload.sub,
      name: payload.name,
      username: payload.username,
      role: payload.role,
      beatCategorySlug: payload.beatCategorySlug,
    },
  };
}

/**
 * For use inside Server Actions (approve/reject/create-user, etc). Middleware
 * already blocks unauthorized requests to the dashboard route these actions
 * are called from, but checking again here is cheap defense-in-depth in case
 * an action is ever invoked from somewhere middleware doesn't cover.
 */
export async function requireRole(minimumRole: UserRole): Promise<Session> {
  const session = await getSession();
  if (!session || !hasRole(session.user.role, minimumRole)) {
    throw new Error("دسترسی غیرمجاز.");
  }
  return session;
}
