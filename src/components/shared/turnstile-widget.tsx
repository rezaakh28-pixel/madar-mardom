"use client";

import * as React from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let scriptLoadingPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window !== "undefined" && window.turnstile) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Real Cloudflare Turnstile widget — replaces the old "من ربات نیستم" checkbox
 * placeholder. Requires NEXT_PUBLIC_TURNSTILE_SITE_KEY (see .env.example);
 * the matching TURNSTILE_SECRET_KEY is verified server-side in the API route
 * that consumes the token (never trust the client-side callback alone).
 */
export function TurnstileWidget({
  onVerify,
  onExpire,
}: {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const [failedToLoad, setFailedToLoad] = React.useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  React.useEffect(() => {
    if (!siteKey) {
      setFailedToLoad(true);
      return;
    }

    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          "expired-callback": () => onExpire?.(),
          "error-callback": () => setFailedToLoad(true),
        });
      })
      .catch(() => setFailedToLoad(true));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey || failedToLoad) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
        کپچا در دسترس نیست. لطفاً بعداً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.
      </p>
    );
  }

  return <div ref={containerRef} />;
}
