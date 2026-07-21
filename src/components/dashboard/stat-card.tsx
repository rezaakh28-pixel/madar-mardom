import type { LucideIcon } from "lucide-react";
import { formatFa } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-numeral text-xl font-extrabold text-foreground">{formatFa(value)}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
