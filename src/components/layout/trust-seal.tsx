"use client";

import Script from "next/script";

declare global {
  interface Window {
    eRasaneh_Trustseal?: (id: number, showLink: boolean) => void;
  }
}

/** E-Rasaneh trust seal — an official Iranian media registration badge. */
export function TrustSeal() {
  return (
    <div className="flex flex-col items-start gap-2">
      <div id="div_eRasanehTrustseal_101338" />
      <Script
        src="https://trustseal.e-rasaneh.ir/trustseal.js"
        strategy="afterInteractive"
        onLoad={() => window.eRasaneh_Trustseal?.(101338, true)}
      />
    </div>
  );
}
