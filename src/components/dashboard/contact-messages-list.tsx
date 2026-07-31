"use client";

import * as React from "react";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { markContactMessageReadAction, deleteContactMessageAction } from "@/app/dashboard/admin/contact-actions";
import { timeAgoFa } from "@/lib/utils";

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "UNREAD" | "READ";
  createdAt: string;
}

export function ContactMessagesList({ messages }: { messages: ContactMessageItem[] }) {
  const [items, setItems] = React.useState(messages);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function handleMarkRead(id: string) {
    setBusyId(id);
    await markContactMessageReadAction(id);
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status: "READ" } : m)));
    setBusyId(null);
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    await deleteContactMessageAction(id);
    setItems((prev) => prev.filter((m) => m.id !== id));
    setBusyId(null);
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        پیامی دریافت نشده است.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((m) => (
        <div key={m.id} className="rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={m.status === "UNREAD" ? "secondary" : "muted"}>
                {m.status === "UNREAD" ? "خوانده‌نشده" : "خوانده‌شده"}
              </Badge>
              <span className="font-bold text-foreground">{m.name}</span>
              <span dir="ltr" className="text-xs text-muted-foreground">
                {m.email}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{timeAgoFa(m.createdAt)}</span>
          </div>

          <p className="text-sm text-muted-foreground">{m.message}</p>

          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            {m.status === "UNREAD" && (
              <Button size="sm" variant="outline" className="gap-1.5" disabled={busyId === m.id} onClick={() => handleMarkRead(m.id)}>
                <MailOpen className="h-3.5 w-3.5" />
                علامت‌گذاری به‌عنوان خوانده‌شده
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-destructive hover:text-destructive"
              disabled={busyId === m.id}
              onClick={() => handleDelete(m.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              حذف
            </Button>
            <a href={`mailto:${m.email}`} className="mr-auto flex items-center gap-1.5 text-xs text-primary hover:underline">
              <Mail className="h-3.5 w-3.5" />
              پاسخ با ایمیل
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
