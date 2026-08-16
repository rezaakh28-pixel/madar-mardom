"use server";

import { requireRole } from "@/lib/session";
import { getUserActivity, type UserActivityFilter, type UserActivitySummary } from "@/lib/content";

export interface GetUserActivityResult {
  ok: boolean;
  activity?: UserActivitySummary;
  error?: string;
}

/** Powers the activity detail view opened by clicking a reporter/editor's name in the admin panel. */
export async function getUserActivityAction(
  userId: string,
  filter: UserActivityFilter
): Promise<GetUserActivityResult> {
  await requireRole("ADMIN");

  try {
    const activity = await getUserActivity(userId, filter);
    return { ok: true, activity };
  } catch {
    return { ok: false, error: "دریافت اطلاعات فعالیت با خطا مواجه شد." };
  }
}
