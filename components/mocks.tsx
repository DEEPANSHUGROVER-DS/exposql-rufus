"use client";

import { motion } from "framer-motion";
import { Check, ShieldAlert, Sparkles } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProposalMock() {
  const rows = [
    { item: "Discovery & strategy", price: "$4,000" },
    { item: "Design system", price: "$6,500" },
    { item: "Build & launch", price: "$12,000" },
  ];
  return (
    <div>
      <div className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-4">
        <div className="h-2.5 w-1/3 rounded-full bg-ink-900/15" />
        <div className="mt-2 h-2 w-2/3 rounded-full bg-ink-900/10" />
        <div className="mt-5 space-y-2">
          {rows.map((r, i) => (
            <motion.div
              key={r.item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.25, ease }}
              className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
            >
              <span className="text-ink-700">{r.item}</span>
              <span className="font-semibold text-ink-900">{r.price}</span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex items-center justify-between rounded-xl bg-ink-900 px-3 py-2.5 text-sm text-paper-50"
          >
            <span>Total</span>
            <span className="font-semibold">$22,500</span>
          </motion.div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.35 }}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700"
      >
        <Check className="h-3.5 w-3.5" /> Branded & e-sign ready
      </motion.div>
    </div>
  );
}

export function RfpMock() {
  const qs = [
    "Where is customer data hosted?",
    "Do you encrypt data at rest?",
    "Is there an incident response plan?",
  ];
  return (
    <div className="space-y-2.5">
      {qs.map((q, i) => (
        <motion.div
          key={q}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.4, ease }}
          className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-3.5"
        >
          <div className="text-xs font-semibold text-ink-700">{q}</div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 + i * 0.4 }}
            className="mt-2 flex items-center gap-2"
          >
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500">
              <Check className="h-2.5 w-2.5 text-white" />
            </span>
            <span className="text-xs text-ink-500">Answered from knowledge base</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export function ContractMock() {
  return (
    <div>
      <div className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-4 text-sm leading-relaxed text-ink-600">
        The Provider may modify fees{" "}
        <motion.mark
          initial={{ backgroundColor: "rgba(255,211,174,0)" }}
          animate={{ backgroundColor: "rgba(255,211,174,0.85)" }}
          transition={{ delay: 0.4 }}
          className="rounded px-1 text-ink-900"
        >
          at any time without notice
        </motion.mark>
        . This agreement{" "}
        <motion.mark
          initial={{ backgroundColor: "rgba(255,196,214,0)" }}
          animate={{ backgroundColor: "rgba(255,196,214,0.85)" }}
          transition={{ delay: 0.8 }}
          className="rounded px-1 text-ink-900"
        >
          auto-renews for 24 months
        </motion.mark>{" "}
        unless cancelled in writing.
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-silk-blush/50 bg-silk-blush/30 px-3 py-1 text-xs font-semibold text-ink-700"
        >
          <ShieldAlert className="h-3.5 w-3.5" /> 2 red flags found
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/10 bg-paper-100 px-3 py-1 text-xs font-semibold text-ink-700"
        >
          <Sparkles className="h-3.5 w-3.5" /> Plain-English summary ready
        </motion.span>
      </div>
    </div>
  );
}
