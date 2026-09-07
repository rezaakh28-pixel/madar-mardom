import Link from "next/link";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Homepage CTA box inviting readers to submit their own voice/report — sits under SpecialCaseBox. */
export function VoiceCtaBox() {
  return (
    <section
      aria-labelledby="voice-cta-heading"
      className="flex flex-col items-start gap-3 overflow-hidden rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <Mic className="h-4.5 w-4.5" />
        </span>
        <h2 id="voice-cta-heading" className="text-base font-extrabold text-foreground">
          صدای مردم
        </h2>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        هر آنچه در اطراف خود می‌بینید، مدار مردم می‌شنود. خبر، عکس یا گزارش خود را با ما در میان بگذارید
      </p>

      <Button asChild variant="secondary" className="mt-1 w-full">
        <Link href="/voice">ثبت خبر یا گزارش</Link>
      </Button>
    </section>
  );
}
