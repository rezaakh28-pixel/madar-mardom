"use client";

import { CATEGORIES } from "@/lib/mock-data";

export function BeatCheckboxGroup({ name, defaultValues = [] }: { name: string; defaultValues?: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.filter((c) => c.slug !== "voice").map((c) => (
        <label
          key={c.slug}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-input px-3 py-1.5 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent has-[:checked]:text-primary"
        >
          <input
            type="checkbox"
            name={name}
            value={c.slug}
            defaultChecked={defaultValues.includes(c.slug)}
            className="h-3.5 w-3.5 accent-primary"
          />
          {c.title}
        </label>
      ))}
    </div>
  );
}
