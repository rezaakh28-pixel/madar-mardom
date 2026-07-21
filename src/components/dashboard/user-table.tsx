"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardUser, UserRole } from "@/types";
import { updateUserRoleAction, toggleUserActiveAction } from "@/app/(dashboard)/admin/actions";
import { ROLE_LABELS_FA } from "@/lib/auth";
import { formatJalali } from "@/lib/utils";

const ROLE_OPTIONS: UserRole[] = ["REPORTER", "EDITOR", "ADMIN"];

export function UserTable({ users: initialUsers }: { users: DashboardUser[] }) {
  const [users, setUsers] = React.useState(initialUsers);

  async function handleRoleChange(user: DashboardUser, role: UserRole) {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
    await updateUserRoleAction(user.id, role);
  }

  async function handleToggleActive(user: DashboardUser) {
    const next = !user.isActive;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: next } : u)));
    await toggleUserActiveAction(user.id, next);
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
                  {user.email}
                </p>
              </td>
              <td className="p-3">
                <Select value={user.role} onValueChange={(value) => handleRoleChange(user, value as UserRole)}>
                  <SelectTrigger className="h-9 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS_FA[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="p-3">
                <Badge variant={user.isActive ? "success" : "muted"}>{user.isActive ? "فعال" : "غیرفعال"}</Badge>
              </td>
              <td className="p-3 text-xs text-muted-foreground">{formatJalali(user.joinedAt)}</td>
              <td className="p-3">
                <Button variant="outline" size="sm" onClick={() => handleToggleActive(user)}>
                  {user.isActive ? "غیرفعال کردن" : "فعال کردن"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
