"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  CONSENT_VERSION,
  DEFAULT_DENIED,
  browserSignalsOptOut,
  loadConsent,
  saveConsent,
  type CookieConsent,
} from "@/lib/cookies";

interface ConsentContextValue {
  /** Current consent record (or DEFAULT_DENIED before the user chooses). */
  consent: CookieConsent;
  /** True until a choice is made (or GPC pre-decides). */
  needsDecision: boolean;
  /** Show the banner programmatically — e.g. when the footer link is clicked. */
  openBanner: () => void;
  /** Hide the banner. */
  closeBanner: () => void;
  /** True when the banner is visible. */
  isOpen: boolean;
  /** Set both categories explicitly. */
  setConsent: (analytics: boolean, marketing: boolean) => void;
  /** Convenience presets. */
  acceptAll: () => void;
  rejectAll: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<CookieConsent>(DEFAULT_DENIED);
  const [needsDecision, setNeedsDecision] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const existing = loadConsent();
    if (existing) {
      setConsentState(existing);
      setNeedsDecision(false);
      return;
    }
    // No record yet. If the browser signals GPC, treat that as a reject
    // decision without showing the banner — required for CCPA/CPRA.
    if (browserSignalsOptOut()) {
      const recorded = saveConsent({ analytics: false, marketing: false });
      setConsentState(recorded);
      setNeedsDecision(false);
      return;
    }
    setNeedsDecision(true);
    setIsOpen(true);
  }, []);

  const setConsent = useCallback((analytics: boolean, marketing: boolean) => {
    const recorded = saveConsent({ analytics, marketing });
    setConsentState(recorded);
    setNeedsDecision(false);
    setIsOpen(false);
  }, []);

  const acceptAll = useCallback(() => setConsent(true, true), [setConsent]);
  const rejectAll = useCallback(() => setConsent(false, false), [setConsent]);
  const openBanner = useCallback(() => setIsOpen(true), []);
  const closeBanner = useCallback(() => setIsOpen(false), []);

  return (
    <ConsentContext.Provider
      value={{
        consent,
        needsDecision,
        isOpen,
        openBanner,
        closeBanner,
        setConsent,
        acceptAll,
        rejectAll,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    // Fall back to "everything denied" so callers in test/isolated contexts
    // can still read a sensible value without throwing.
    return {
      consent: DEFAULT_DENIED,
      needsDecision: false,
      isOpen: false,
      openBanner: () => {},
      closeBanner: () => {},
      setConsent: () => {},
      acceptAll: () => {},
      rejectAll: () => {},
    } as ConsentContextValue;
  }
  return ctx;
}

export const CURRENT_CONSENT_VERSION = CONSENT_VERSION;
