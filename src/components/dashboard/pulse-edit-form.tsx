"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updatePulseItemsAction } from "@/app/dashboard/pulse-actions";
import type { PulseItem, PulseTrend } from "@/types";

const TREND_OPTIONS: Array<{ value: PulseTrend; label: string }> = [
  { value: "up", label: "صعودی" },
  { value: "down", label: "نزولی" },
  { value: "flat", label: "ثابت" },
];

export function PulseEditForm({ items: initialItems }: { items: PulseItem[] }) {
  const [items, setItems] = React.useState(initialItems);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "error" | "success"; text: string } | null>(null);

  function patch(metric: string, changes: Partial<PulseItem>) {
    setItems((prev) => prev.map((item) => (item.metric === metric ? { ...item, ...changes } : item)));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await updatePulseItemsAction(
      items.map((item) => ({
        metric: item.metric,
        label: item.label,
        value: item.value,
        unit: item.unit,
        trend: item.trend,
        changePercent: item.changePercent,
      }))
    );
    setSaving(false);
    setMessage(
      result.success
        ? { type: "success", text: "تغییرات ذخیره شد و روی صفحه اصلی به‌روزرسانی خواهد شد." }
        : { type: "error", text: result.error ?? "ذخیره تغییرات با خطا مواجه شد." }
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-right text-xs text-muted-foreground">
              <th className="p-3 font-medium">شاخص</th>
              <th className="p-3 font-medium">مقدار</th>
              <th className="p-3 font-medium">واحد</th>
              <th className="p-3 font-medium">روند</th>
              <th className="p-3 font-medium">درصد تغییر</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.metric} className="border-b border-border last:border-0">
                <td className="p-2">
                  <Input
                    value={item.label}
                    onChange={(e) => patch(item.metric, { label: e.target.value })}
                    className="h-9 min-w-32"
                  />
                </td>
                <td className="p-2">
                  <Input
                    dir="ltr"
                    value={item.value}
                    onChange={(e) => patch(item.metric, { value: e.target.value })}
                    className="h-9 min-w-24 font-numeral"
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={item.unit ?? ""}
                    onChange={(e) => patch(item.metric, { unit: e.target.value })}
                    className="h-9 min-w-20"
                  />
                </td>
                <td className="p-2">
                  <Select value={item.trend} onValueChange={(v) => patch(item.metric, { trend: v as PulseTrend })}>
                    <SelectTrigger className="h-9 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TREND_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Input
                    dir="ltr"
                    type="number"
                    step="0.1"
                    value={item.changePercent ?? ""}
                    onChange={(e) =>
                      patch(item.metric, { changePercent: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="h-9 w-24 font-numeral"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" className="gap-1.5 self-start" disabled={saving} onClick={handleSave}>
          <Save className="h-4 w-4" />
          {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </Button>
        {message && (
          <span className={`text-sm ${message.type === "success" ? "text-rise" : "text-destructive"}`}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
