"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { plans, creditPacks, actionCosts, creditRange } from "@/lib/pricing";
import { stripePaymentLinks } from "@/lib/stripe";

const ease = [0.22, 1, 0.36, 1] as const;

export function PricingClient() {
  const [mode, setMode] = useState<"plans" | "credits">("plans");

  return (
    <div>
      {/* toggle */}
      <Reveal>
        <div className="flex justify-center">
          <div className="relative inline-flex rounded-full border border-ink-900/[0.08] bg-paper-50/70 p-1 backdrop-blur">
            {(["plans", "credits"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  mode === m ? "text-paper-50" : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="pricing-toggle"
                    className="absolute inset-0 rounded-full bg-ink-900"
                    transition={{ duration: 0.35, ease }}
                  />
                )}
                <span className="relative">{m === "plans" ? "Monthly plans" : "Credit packs"}</span>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {mode === "plans" ? (
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => (
            <Reveal key={p.key} delay={i * 0.06}>
              <div
                className={`card relative flex h-full flex-col overflow-hidden p-7 ${
                  p.featured ? "shadow-lift ring-1 ring-accent/30" : ""
                }`}
              >
                {p.featured && <span className="shimmer-sweep" />}
                <div className="relative flex h-full flex-col">
                  {p.featured && (
                    <span className="chip mb-4 w-fit border-accent/20 bg-accent/10 text-accent">Most popular</span>
                  )}
                  <h3 className="text-lg font-semibold text-ink-900">{p.name}</h3>
                  <p className="mt-1 text-sm text-ink-400">{p.tagline}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-[-0.02em] text-ink-900">
                      ${p.priceMonthly}
                    </span>
                    <span className="text-sm text-ink-400">/mo</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-400">{p.note}</p>
                  {p.stripePriceKey ? (
                    <a
                      href={stripePaymentLinks[p.stripePriceKey]}
                      className={`mt-5 w-full ${p.featured ? "btn-dark" : "btn-soft"}`}
                    >
                      Choose {p.name}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link href="/app" className={`mt-5 w-full ${p.featured ? "btn-dark" : "btn-soft"}`}>
                      Start free
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                  <ul className="mt-6 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-ink-700">
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ink-900 text-paper-50">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <Reveal>
            <div className="card relative overflow-hidden p-8 sm:p-10">
              <span className="shimmer-sweep" />
              <div className="relative">
                <h3 className="text-2xl font-semibold tracking-[-0.02em] text-ink-900">
                  Buy credits, <span className="accent-italic text-accent">never expire</span>.
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">
                  Anyone can buy a credit pack — no subscription required. Every AI action shows a credit
                  range before it runs and deducts the actual amount after. Manual editing is always free.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {creditPacks.map((p) => (
                    <div
                      key={p.credits}
                      className="rounded-2xl border border-ink-900/[0.07] bg-paper-50/70 p-5 transition-shadow duration-300 hover:shadow-soft"
                    >
                      <div className="text-2xl font-semibold tracking-[-0.02em] text-ink-900">
                        {p.credits.toLocaleString()}{" "}
                        <span className="text-sm font-medium text-ink-400">credits</span>
                      </div>
                      <div className="mt-1 text-sm text-ink-500">
                        ${p.price}{" "}
                        <span className="text-ink-400">
                          · ${(p.price / p.credits).toFixed(3)}/credit
                        </span>
                      </div>
                      <a
                        href={stripePaymentLinks[p.key]}
                        className="btn-soft mt-4 w-full py-2.5 text-[13px]"
                      >
                        Buy pack
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* what actions cost */}
      <Reveal delay={0.1}>
        <div className="card relative mt-10 overflow-hidden p-7 sm:p-8">
          <span className="shimmer-sweep" />
          <div className="relative">
            <h4 className="text-sm font-semibold text-ink-900">What each action costs</h4>
            <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {actionCosts.map((a) => (
                <div
                  key={a.key}
                  className="flex items-center justify-between gap-4 border-b border-ink-900/[0.06] pb-2.5"
                >
                  <span className="text-sm text-ink-700">{a.label}</span>
                  <span className="shrink-0 text-sm font-semibold text-ink-900">
                    {creditRange(a.min, a.max, a.unit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* credits explainer */}
      <Reveal delay={0.1}>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {[
            { t: "See the cost first", b: "Every AI action shows a credit range before you click. No surprises." },
            { t: "Pay for output, not edits", b: "Generating costs credits by length. Manual edits in the editor are always free." },
            { t: "Blocks at zero", b: "Run out and AI actions pause until you top up. A ledger records every spend and purchase." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-ink-900/[0.07] bg-white/70 p-5">
              <h4 className="text-sm font-semibold text-ink-900">{c.t}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{c.b}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <p className="mt-10 text-center text-xs text-ink-400">
        Pricing is in draft for review — see PRICING.md for the margin model behind these numbers.
      </p>
    </div>
  );
}
