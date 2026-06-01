"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useApp } from "./AppProvider";

/**
 * Renders a small nudge above the workspace tools when credits are exhausted
 * or running on fumes. Pass `threshold` to surface the warning earlier (the
 * default 0 means "actually out").
 */
export function OutOfCreditsBanner({ threshold = 0, className = "" }: { threshold?: number; className?: string }) {
  const { remaining, creditsIncluded, creditsUsed, ledger } = useApp();
  if (remaining > threshold) return null;
  const out = remaining <= 0;
  // "First time" = the workspace has never had credits and never spent any —
  // a fresh signup hasn't bought their first pack yet. Different copy so it
  // reads as an invitation, not an alert.
  const firstTime = out && creditsIncluded === 0 && creditsUsed === 0 && ledger.length === 0;

  return (
    <div
      className={`mb-5 flex flex-col items-start justify-between gap-3 rounded-2xl border ${
        firstTime
          ? "border-accent/30 bg-accent/[0.05]"
          : out
          ? "border-rose-500/30 bg-rose-500/[0.06]"
          : "border-amber-500/30 bg-amber-500/[0.06]"
      } p-4 sm:flex-row sm:items-center ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
            firstTime
              ? "bg-accent/15 text-accent"
              : out
              ? "bg-rose-500/20 text-rose-700"
              : "bg-amber-500/20 text-amber-700"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-900">
            {firstTime
              ? "Buy your first credit pack to start generating."
              : out
              ? "You're out of credits."
              : `Only ${remaining.toLocaleString()} credits left.`}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
            {firstTime
              ? "Free signup, pay only when you generate. Start at $15 for 100 credits — no subscription required. Manual editing is free regardless."
              : out
              ? "AI actions are paused until you top up. Manual editing keeps working — it's always free."
              : `Top up to keep generating without interruption.`}
          </p>
        </div>
      </div>
      <Link href="/app/settings" className="btn-dark py-2.5 text-[12px]">
        {firstTime ? "Buy credits" : "Top up"} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
