"use client";

import * as React from "react";
import { getYear, getMonth, getDate, getDaysInMonth, setYear, setMonth, setDate } from "date-fns-jalali";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatFa } from "@/lib/utils";

const MONTHS_FA = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

interface JalaliDateTimePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  className?: string;
}

/**
 * A compact Jalali (Persian calendar) date + time picker. Built on
 * date-fns-jalali (a drop-in, Jalali-calendar-aware replacement for
 * date-fns — same function names/signatures, Persian year/month/day math).
 * Internally this always works with a real JS Date; only the display is
 * Jalali, so the value handed to onChange is a normal Date ready for Prisma.
 */
export function JalaliDateTimePicker({ value, onChange, className }: JalaliDateTimePickerProps) {
  const base = value ?? new Date();

  const year = getYear(base);
  const month = getMonth(base); // 0-11
  const day = getDate(base);
  const hours = base.getHours();
  const minutes = base.getMinutes();

  const daysInMonth = getDaysInMonth(base);
  const currentJalaliYear = getYear(new Date());
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentJalaliYear + i);

  function commit(next: Date) {
    onChange(next);
  }

  function handleYearChange(y: string) {
    commit(setYear(base, Number(y)));
  }

  function handleMonthChange(m: string) {
    const targetMonth = Number(m);
    const maxDay = getDaysInMonth(setMonth(base, targetMonth));
    const clampedDay = Math.min(day, maxDay);
    commit(setDate(setMonth(base, targetMonth), clampedDay));
  }

  function handleDayChange(d: string) {
    commit(setDate(base, Number(d)));
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [h, m] = e.target.value.split(":").map(Number);
    const next = new Date(base);
    next.setHours(h ?? 0, m ?? 0, 0, 0);
    commit(next);
  }

  const timeValue = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Select value={String(day)} onValueChange={handleDayChange}>
          <SelectTrigger className="h-9 w-[4.5rem] border-primary/30 font-numeral focus:ring-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <SelectItem key={d} value={String(d)} className="font-numeral">
                {formatFa(d)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(month)} onValueChange={handleMonthChange}>
          <SelectTrigger className="h-9 w-28 border-primary/30 focus:ring-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS_FA.map((label, index) => (
              <SelectItem key={label} value={String(index)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(year)} onValueChange={handleYearChange}>
          <SelectTrigger className="h-9 w-24 border-primary/30 font-numeral focus:ring-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)} className="font-numeral">
                {formatFa(y)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          className="h-9 w-28 border-primary/30 font-numeral focus-visible:ring-primary"
          aria-label="ساعت انتشار"
        />
      </div>
    </div>
  );
}
