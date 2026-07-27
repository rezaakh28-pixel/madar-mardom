import { db } from "@/lib/db";
import type { PulseItem, PulseMetric, PulseTrend } from "@/types";

// ---------------------------------------------------------------------------
// "نبض جامعه" (Pulse of Society) — real, editable data (see PulseItem model
// in prisma/schema.prisma). Editable from the admin panel, and from an
// editor's panel if "economy" is one of their assigned beats.
// ---------------------------------------------------------------------------

export const PULSE_METRICS: Array<{ metric: PulseMetric; label: string; unit?: string }> = [
  { metric: "usd", label: "دلار", unit: "تومان" },
  { metric: "gold", label: "طلای ۱۸ عیار", unit: "تومان" },
  { metric: "coin", label: "سکه امامی", unit: "تومان" },
  { metric: "stock", label: "شاخص بورس" },
  { metric: "inflation", label: "تورم نقطه‌به‌نقطه", unit: "درصد" },
  { metric: "subsidy", label: "یارانه نقدی", unit: "تومان" },
  { metric: "gasoline", label: "بنزین سهمیه‌ای", unit: "ریال" },
  { metric: "housing", label: "متوسط اجاره تهران", unit: "میلیون تومان" },
  { metric: "weather", label: "دمای تهران", unit: "درجه" },
  { metric: "pollution", label: "کیفیت هوا" },
];

export async function getPulseItems(): Promise<PulseItem[]> {
  const rows = await db.pulseItem.findMany();
  const byMetric = new Map(rows.map((r) => [r.metric, r]));

  return PULSE_METRICS.map(({ metric, label, unit }) => {
    const row = byMetric.get(metric);
    return {
      metric,
      label: row?.label ?? label,
      value: row?.value ?? "—",
      unit: row?.unit ?? unit,
      trend: (row?.trend as PulseTrend) ?? "flat",
      changePercent: row?.changePercent ?? undefined,
      updatedAt: row?.updatedAt.toISOString() ?? new Date(0).toISOString(),
    };
  });
}

export interface UpdatePulseItemInput {
  metric: PulseMetric;
  label: string;
  value: string;
  unit?: string;
  trend: PulseTrend;
  changePercent?: number;
}

export async function upsertPulseItem(input: UpdatePulseItemInput) {
  return db.pulseItem.upsert({
    where: { metric: input.metric },
    update: {
      label: input.label,
      value: input.value,
      unit: input.unit || null,
      trend: input.trend,
      changePercent: input.changePercent ?? null,
    },
    create: {
      metric: input.metric,
      label: input.label,
      value: input.value,
      unit: input.unit || null,
      trend: input.trend,
      changePercent: input.changePercent ?? null,
    },
  });
}
