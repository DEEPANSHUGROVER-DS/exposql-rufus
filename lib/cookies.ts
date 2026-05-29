/**
 * Cookie consent — model + storage helpers.
 *
 * We store one JSON record in localStorage. Three categories:
 *   - `necessary` is always true (session auth, consent record itself).
 *   - `analytics` defaults off; only loads GA4/GTM-style scripts when true.
 *   - `marketing` defaults off; reserved for future ad pixels.
 *
 * Version-stamped so we can re-prompt if categories change.
 */

export const CONSENT_VERSION = 1;
const STORAGE_KEY = "rufus.consent.v1";

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface CookieConsent {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  /** ms since epoch. When this record was saved. */
  ts: number;
}

export const DEFAULT_DENIED: CookieConsent = {
  version: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
  ts: 0,
};

export function loadConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (parsed?.version !== CONSENT_VERSION) return null;
    return {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      ts: typeof parsed.ts === "number" ? parsed.ts : 0,
    };
  } catch {
    return null;
  }
}

export function saveConsent(c: Omit<CookieConsent, "version" | "ts" | "necessary"> & { necessary?: true }): CookieConsent {
  const record: CookieConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: Boolean(c.analytics),
    marketing: Boolean(c.marketing),
    ts: Date.now(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      /* ignore */
    }
  }
  return record;
}

export function clearConsent() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Honor the Global Privacy Control browser signal. When the user's browser
 * sends GPC, we treat that as a "reject non-essential" intent — required by
 * California regulations and good practice elsewhere.
 */
export function browserSignalsOptOut(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return Boolean(nav.globalPrivacyControl);
}
