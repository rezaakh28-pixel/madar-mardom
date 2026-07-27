"use client";

import * as React from "react";
import type { User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleUserActiveAction } from "@/app/dashboard/admin/actions";
import { ROLE_LABELS_FA } from "@/lib/auth";
import { formatJalali } from "@/lib/utils";
import type { UserRole } from "@/types";

export function UserTable({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = React.useState(initialUsers);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function handleToggleActive(user: User) {
    const next = !user.isActive;
    setBusyId(user.id);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: next } : u)));
    await toggleUserActiveAction(user.id, next);
    setBusyId(null);
  }

  if (users.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        هنوز کاربری ثبت نشده است.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-right text-xs text-muted-foreground">
            <th className="p-3 font-medium">کاربر</th>
            <th className="p-3 font-medium">نقش</th>
            <th className="p-3 font-medium">وضعیت</th>
            <th className="p-3 font-medium">تاریخ عضویت</th>
            <th className="p-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border last:border-0">
              <td className="p-3">
                <p className="font-medium text-foreground">{user.name}</p>
                <p dir="ltr" className="text-left text-xs text-muted-foreground">
                  {user.username} · {user.email}
                </p>
              </td>
              <td className="p-3">
                <Badge variant="outline">{ROLE_LABELS_FA[user.role as UserRole]}</Badge>
              </td>
              <td className="p-3">
                <Badge variant={user.isActive ? "success" : "muted"}>{user.isActive ? "فعال" : "غیرفعال"}</Badge>
              </td>
              <td className="p-3 text-xs text-muted-foreground">{formatJalali(user.createdAt)}</td>
              <td className="p-3">
                {user.role !== "ADMIN" && (
                  <Button variant="outline" size="sm" disabled={busyId === user.id} onClick={() => handleToggleActive(user)}>
                    {user.isActive ? "غیرفعال کردن" : "فعال کردن"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
