"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MousePointer2, Sparkles } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

// Scripted positions (in % of the window) the cursor moves through.
const steps = [
  { cursor: { x: 28, y: 26 }, label: "Pasting questionnaire…" },
  { cursor: { x: 78, y: 20 }, label: "Detecting questions…" },
  { cursor: { x: 50, y: 58 }, label: "Drafting from knowledge base…" },
  { cursor: { x: 82, y: 84 }, label: "Approving answers…" },
] as const;

const rows = [
  { q: "Where is customer data hosted?", src: "Security overview" },
  { q: "Do you encrypt data at rest?", src: "Data retention policy" },
  { q: "What is your uptime SLA?", src: "SLA terms" },
];

export function CursorWindow() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setStep((s) => (s + 1) % steps.length), 2600);
    return () => clearTimeout(id);
  }, [step]);

  const detected = step >= 1;
  const answered = step >= 2;
  const approved = step >= 3;

  return (
    <div className="card relative overflow-hidden shadow-lift">
      <span className="shimmer-sweep" />
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-ink-900/[0.06] bg-paper-100/70 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-silk-blush" />
        <span className="h-3 w-3 rounded-full bg-silk-peach" />
        <span className="h-3 w-3 rounded-full bg-silk-mint" />
        <div className="ml-3 flex-1 truncate rounded-full bg-white/70 px-3 py-1 text-[11px] text-ink-400">
          rufus.exposql.com / rfp
        </div>
      </div>

      <div className="relative p-5">
        {/* status line */}
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <AnimatePresence mode="wait">
            <motion.span
              key={steps[step].label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease }}
              className="text-xs font-semibold text-ink-700"
            >
              {steps[step].label}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="space-y-2.5">
          {rows.map((r, i) => (
            <div key={r.q} className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-ink-700">{r.q}</span>
                <AnimatePresence>
                  {detected && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.12, ease }}
                      className="chip shrink-0 text-[10px]"
                    >
                      Q{i + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: i * 0.18, ease, duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full transition-colors ${
                          approved ? "bg-emerald-500" : "bg-ink-900/20"
                        }`}
                      >
                        <Check className="h-2.5 w-2.5 text-white" />
                      </span>
                      <span className="text-[11px] text-ink-500">
                        Answered from <span className="font-medium text-ink-700">{r.src}</span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* scripted cursor */}
        <motion.div
          className="pointer-events-none absolute z-10"
          animate={{ left: `${steps[step].cursor.x}%`, top: `${steps[step].cursor.y}%` }}
          transition={{ duration: 0.9, ease }}
        >
          <MousePointer2 className="h-5 w-5 -translate-x-1 -translate-y-1 fill-ink-900 text-ink-900 drop-shadow" />
        </motion.div>
      </div>
    </div>
  );
}
