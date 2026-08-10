"use client";

import { RectangleHorizontal, RectangleVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const POSITIONS: Array<{ value: string; label: string }> = [
  { value: "top left", label: "بالا-چپ" },
  { value: "top", label: "بالا-وسط" },
  { value: "top right", label: "بالا-راست" },
  { value: "left", label: "وسط-چپ" },
  { value: "center", label: "مرکز" },
  { value: "right", label: "وسط-راست" },
  { value: "bottom left", label: "پایین-چپ" },
  { value: "bottom", label: "پایین-وسط" },
  { value: "bottom right", label: "پایین-راست" },
];

interface CoverImagePositionPickerProps {
  orientation: "landscape" | "portrait";
  position: string;
  onOrientationChange: (value: "landscape" | "portrait") => void;
  onPositionChange: (value: string) => void;
}

export function CoverImagePositionPicker({
  orientation,
  position,
  onOrientationChange,
  onPositionChange,
}: CoverImagePositionPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>جهت تصویر</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={orientation === "landscape" ? "secondary" : "outline"}
            className="gap-1.5"
            onClick={() => onOrientationChange("landscape")}
          >
            <RectangleHorizontal className="h-3.5 w-3.5" />
            افقی
          </Button>
          <Button
            type="button"
            size="sm"
            variant={orientation === "portrait" ? "secondary" : "outline"}
            className="gap-1.5"
            onClick={() => onOrientationChange("portrait")}
          >
            <RectangleVertical className="h-3.5 w-3.5" />
            عمودی
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>کدام قسمت تصویر نمایش داده شود</Label>
        <div className="grid w-40 grid-cols-3 gap-1 rounded-md border border-input p-1.5">
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              title={p.label}
              aria-label={p.label}
              onClick={() => onPositionChange(p.value)}
              className={cn(
                "flex h-9 items-center justify-center rounded-sm border transition-colors",
                position === p.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-transparent bg-muted hover:border-primary/40"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-70" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
