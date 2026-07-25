"use client";

import * as React from "react";
import type { User } from "@prisma/client";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveReporterAction, rejectReporterAction } from "@/app/(dashboard)/admin/actions";
import { formatJalali } from "@/lib/utils";

export function PendingReporters({ users }: { users: User[] }) {
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function handleApprove(userId: string) {
    setBusyId(userId);
    await approveReporterAction(userId);
    setBusyId(null);
  }

  async function handleReject(userId: string) {
    setBusyId(userId);
    await rejectReporterAction(userId);
    setBusyId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-foreground">{user.name}</p>
            <p dir="ltr" className="text-left text-xs text-muted-foreground">
              {user.username} · {user.email}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">درخواست در {formatJalali(user.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1.5" disabled={busyId === user.id} onClick={() => handleApprove(user.id)}>
              <Check className="h-3.5 w-3.5" />
              تأیید
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              disabled={busyId === user.id}
              onClick={() => handleReject(user.id)}
            >
              <X className="h-3.5 w-3.5" />
              رد کردن
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
