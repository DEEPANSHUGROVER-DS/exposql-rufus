"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ShieldAlert, Sparkles } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Auto-replay timer + manual trigger. Returns the current cycle number
 * (use it as a key to remount/replay children) and an `advance` function
 * to bump it immediately (e.g. on hover). */
function useReplay(every: number) {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCycle((c) => c + 1), every);
    return () => clearInterval(id);
  }, [every]);
  return { cycle, advance: () => setCycle((c) => c + 1) };
}

export function ProposalMock() {
  const { cycle, advance } = useReplay(6200);
  const rows = [
    { item: "Discovery & strategy", price: "$4,000" },
    { item: "Design system", price: "$6,500" },
    { item: "Build & launch", price: "$12,000" },
  ];
  return (
    <div onMouseEnter={advance} className="select-none">
      <div className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-4">
        <motion.div
          className="h-2.5 w-1/3 rounded-full bg-ink-900/15"
          animate={{ width: ["33%", "55%", "33%"] }}
          transition={{ duration: 5, repeat: Infinity, ease }}
        />
        <motion.div
          className="mt-2 h-2 w-2/3 rounded-full bg-ink-900/10"
          animate={{ width: ["66%", "48%", "66%"] }}
          transition={{ duration: 5, repeat: Infinity, ease, delay: 0.4 }}
        />
        <div key={cycle} className="mt-5 space-y-2">
          {rows.map((r, i) => (
            <motion.div
              key={r.item}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.22, ease }}
              className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-[0_1px_0_rgba(27,26,22,0.04)]"
            >
              <span className="text-ink-700">{r.item}</span>
              <motion.span
                className="font-semibold text-ink-900"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 + i * 0.22, ease }}
              >
                {r.price}
              </motion.span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.05, ease }}
            className="relative flex items-center justify-between overflow-hidden rounded-xl bg-ink-900 px-3 py-2.5 text-sm text-paper-50"
          >
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              animate={{ x: ["0%", "400%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.2 }}
            />
            <span>Total</span>
            <motion.span className="font-semibold" animate={{ y: [0, -1, 0] }} transition={{ duration: 3, repeat: Infinity, ease }}>
              $22,500
            </motion.span>
          </motion.div>
        </div>
      </div>
      <motion.div
        key={`badge-${cycle}`}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, ease }}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700"
      >
        <motion.span animate={{ rotate: [0, 12, -8, 0] }} transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.5 }}>
          <Check className="h-3.5 w-3.5" />
        </motion.span>
        Branded & ready to send
      </motion.div>
    </div>
  );
}

export function RfpMock() {
  const { cycle, advance } = useReplay(6200);
  const qs = [
    "Where is customer data hosted?",
    "Do you encrypt data at rest?",
    "Is there an incident response plan?",
  ];
  return (
    <div onMouseEnter={advance} key={cycle} className="select-none space-y-2.5">
      {qs.map((q, i) => (
        <motion.div
          key={q}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + i * 0.36, ease }}
          className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-3.5"
        >
          <div className="text-xs font-semibold text-ink-700">{q}</div>
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42 + i * 0.36, ease }}
            className="mt-2 flex items-center gap-2"
          >
            <motion.span
              className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 0.6, delay: 0.65 + i * 0.36, ease, repeat: Infinity, repeatDelay: 4.5 }}
            >
              <Check className="h-2.5 w-2.5 text-white" />
            </motion.span>
            <span className="text-xs text-ink-500">Answered from knowledge base</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export function ContractMock() {
  const { cycle, advance } = useReplay(6800);
  return (
    <div onMouseEnter={advance} className="select-none">
      <div key={cycle} className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-4 text-sm leading-relaxed text-ink-600">
        The Provider may modify fees{" "}
        <motion.mark
          initial={{ backgroundColor: "rgba(255,211,174,0)" }}
          animate={{ backgroundColor: ["rgba(255,211,174,0)", "rgba(255,211,174,0.9)", "rgba(255,211,174,0.7)"] }}
          transition={{ delay: 0.45, duration: 1.6, times: [0, 0.4, 1], ease }}
          className="rounded px-1 text-ink-900"
        >
          at any time without notice
        </motion.mark>
        . This agreement{" "}
        <motion.mark
          initial={{ backgroundColor: "rgba(255,196,214,0)" }}
          animate={{ backgroundColor: ["rgba(255,196,214,0)", "rgba(255,196,214,0.9)", "rgba(255,196,214,0.7)"] }}
          transition={{ delay: 0.95, duration: 1.6, times: [0, 0.4, 1], ease }}
          className="rounded px-1 text-ink-900"
        >
          auto-renews for 24 months
        </motion.mark>{" "}
        unless cancelled in writing.
      </div>
      <div key={`chips-${cycle}`} className="mt-4 flex flex-wrap gap-2">
        <motion.span
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.15, ease }}
          className="inline-flex items-center gap-1.5 rounded-full border border-silk-blush/50 bg-silk-blush/30 px-3 py-1 text-xs font-semibold text-ink-700"
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, -6, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 3, ease }}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
          </motion.span>
          2 red flags found
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.35, ease }}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/10 bg-paper-100 px-3 py-1 text-xs font-semibold text-ink-700"
        >
          <motion.span
            animate={{ scale: [1, 1.25, 1], rotate: [0, 12, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.6, ease }}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </motion.span>
          Plain-English summary ready
        </motion.span>
      </div>
    </div>
  );
}
