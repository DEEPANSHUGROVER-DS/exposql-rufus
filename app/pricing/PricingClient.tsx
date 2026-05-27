"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const ease = [0.22, 1, 0.36, 1] as const;

const plans = [
  {
    name: "Free",
    tagline: "Try one of each",
    monthly: "$0",
    note: "Outputs watermarked",
    features: [
      "One proposal, one RFP, one contract review",
      "Manual editing always free",
      "Knowledge base up to 5 entries",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Starter",
    tagline: "For solo operators",
    monthly: "$XX",
    note: "Small monthly credit allowance",
    features: [
      "All three tools",
      "Included AI credits each month",
      "PDF & DOCX export",
      "Manual editing free",
    ],
    cta: "Choose Starter",
    featured: true,
  },
  {
    name: "Growth",
    tagline: "For teams sending often",
    monthly: "$XXX",
    note: "Larger allowance + brand kit",
    features: [
      "Everything in Starter",
      "Brand kit & hosted proposal links",
      "Full knowledge base",
      "Larger monthly credit allowance",
    ],
    cta: "Choose Growth",
    featured: false,
  },
];

const packs = [
  { credits: "XXX", price: "$XX" },
  { credits: "XXX", price: "$XX" },
  { credits: "XXX", price: "$XX" },
  { credits: "XXX", price: "$XX" },
];

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
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div
                className={`card relative flex h-full flex-col overflow-hidden p-8 ${
                  p.featured ? "shadow-lift ring-1 ring-accent/30" : ""
                }`}
              >
                {p.featured && <span className="shimmer-sweep" />}
                <div className="relative">
                  {p.featured && (
                    <span className="chip mb-4 border-accent/20 bg-accent/10 text-accent">Most popular</span>
                  )}
                  <h3 className="text-lg font-semibold text-ink-900">{p.name}</h3>
                  <p className="mt-1 text-sm text-ink-400">{p.tagline}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-[-0.02em] text-ink-900">{p.monthly}</span>
                    <span className="text-sm text-ink-400">/mo</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-400">{p.note}</p>
                  <Link
                    href="/pricing"
                    className={`mt-6 w-full ${p.featured ? "btn-dark" : "btn-soft"}`}
                  >
                    {p.cta} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <ul className="mt-7 space-y-3">
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
                  {packs.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-ink-900/[0.07] bg-paper-50/70 p-5 transition-shadow duration-300 hover:shadow-soft"
                    >
                      <div className="text-2xl font-semibold tracking-[-0.02em] text-ink-900">
                        {p.credits} <span className="text-sm font-medium text-ink-400">credits</span>
                      </div>
                      <div className="mt-1 text-sm text-ink-500">{p.price}</div>
                      <Link href="/pricing" className="btn-soft mt-4 w-full py-2.5 text-[13px]">
                        Buy pack
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* credits explainer */}
      <Reveal delay={0.1}>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
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
        Prices shown as placeholders (e.g. $XX) — set your final numbers before launch.
      </p>
    </div>
  );
}
