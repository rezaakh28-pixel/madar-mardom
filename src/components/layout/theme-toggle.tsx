"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const buttonClassName = compact ? `h-7 w-7 ${className ?? ""}` : className;
  const iconClassName = compact ? "h-3.5 w-3.5" : "h-[1.1rem] w-[1.1rem]";

  if (!mounted) {
    return <Button variant="ghost" size="icon" aria-label="تغییر پوسته" disabled className={buttonClassName} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "روشن کردن پوسته" : "تیره کردن پوسته"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={buttonClassName}
    >
      {isDark ? <Sun className={iconClassName} /> : <Moon className={iconClassName} />}
    </Button>
  );
}
