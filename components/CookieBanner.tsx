"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useCookieConsent } from "./CookieConsent";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * GDPR/CCPA-friendly cookie banner.
 *
 * - Mounts at the bottom of the viewport on first visit.
 * - Three categories: necessary (locked on), analytics, marketing.
 * - "Accept all" and "Reject non-essential" presets, plus a customise pane.
 * - Re-openable via the footer "Cookie preferences" link.
 * - Suppressed entirely when the browser sends Global Privacy Control.
 */
export function CookieBanner() {
  const { isOpen, closeBanner, acceptAll, rejectAll, setConsent, consent, needsDecision } = useCookieConsent();
  const [customising, setCustomising] = useState(false);
  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);

  useEffect(() => {
    setAnalytics(consent.analytics);
    setMarketing(consent.marketing);
  }, [consent.analytics, consent.marketing]);

  // Reset to compact view when the banner is closed
  useEffect(() => {
    if (!isOpen) setCustomising(false);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ ease, duration: 0.4 }}
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl sm:inset-x-6 sm:bottom-6"
          role="dialog"
          aria-modal="false"
          aria-label="Cookie preferences"
        >
          <div className="card relative overflow-hidden p-5 shadow-lift sm:p-6">
            <button
              onClick={closeBanner}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full border border-ink-900/10 text-ink-400 transition-colors hover:text-ink-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-silk-peach/40">
                <Cookie className="h-4 w-4 text-ink-900" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-ink-900">
                  {needsDecision ? "We use cookies." : "Update your cookie preferences."}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">
                  Strictly necessary cookies keep you signed in and remember this choice. Analytics
                  and marketing cookies are off by default — turn them on if you&apos;d like to
                  help us improve the product. Full detail in our{" "}
                  <Link href="/cookies" className="underline hover:text-ink-900">
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            {customising && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ ease, duration: 0.35 }}
                className="mt-5 space-y-3 overflow-hidden"
              >
                <CategoryRow
                  title="Strictly necessary"
                  body="Sign-in session, security, and remembering this choice. Always on — the site won't work without these."
                  checked
                  locked
                  onChange={() => {}}
                />
                <CategoryRow
                  title="Analytics"
                  body="Aggregate, anonymised page-view and feature-usage counts. Helps us see what's used and what's broken."
                  checked={analytics}
                  onChange={setAnalytics}
                />
                <CategoryRow
                  title="Marketing"
                  body="Cross-site advertising and personalisation. None active today — listed in case we add it later."
                  checked={marketing}
                  onChange={setMarketing}
                />
              </motion.div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button onClick={acceptAll} className="btn-dark py-2.5 text-[12px]">
                Accept all
              </button>
              <button onClick={rejectAll} className="btn-soft py-2.5 text-[12px]">
                Reject non-essential
              </button>
              {!customising ? (
                <button
                  onClick={() => setCustomising(true)}
                  className="ml-auto text-[12px] font-semibold text-ink-500 hover:text-ink-900"
                >
                  Customise
                </button>
              ) : (
                <button
                  onClick={() => setConsent(analytics, marketing)}
                  className="ml-auto btn-soft py-2.5 text-[12px]"
                >
                  Save my choices
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CategoryRow({
  title,
  body,
  checked,
  locked = false,
  onChange,
}: {
  title: string;
  body: string;
  checked: boolean;
  locked?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-ink-900/[0.06] bg-paper-50/50 p-3 transition-colors hover:bg-paper-100/40">
      <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={locked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          aria-label={title}
        />
        <span className="absolute inset-0 rounded-full bg-ink-900/15 transition-colors peer-checked:bg-ink-900 peer-disabled:opacity-60" />
        <span className="absolute left-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-ink-900">
          {title}
          {locked && <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-ink-400">required</span>}
        </span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-500">{body}</span>
      </span>
    </label>
  );
}
