"use client";

import { Cookie } from "lucide-react";
import { useCookieConsent } from "./CookieConsent";

/** Footer + policy-page button to re-open the cookie banner. */
export function CookiePreferencesButton({ className = "" }: { className?: string }) {
  const { openBanner } = useCookieConsent();
  return (
    <button
      onClick={openBanner}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700 hover:text-ink-900 ${className}`}
    >
      <Cookie className="h-3.5 w-3.5" />
      Cookie preferences
    </button>
  );
}
