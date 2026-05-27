"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, FileText, ShieldAlert, Sparkles, Wand2 } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;
type Severity = "high" | "medium" | "low";
type Tab = "summary" | "flags" | "edits";

const summary = [
  "Fees: the provider may change pricing during the term.",
  "Term: the agreement renews automatically for 24 months.",
  "Liability: no cap on the provider's liability is specified.",
  "Termination: only the provider may terminate early.",
];

const redFlags: { severity: Severity; clause: string; reason: string }[] = [
  { severity: "high", clause: "Auto-renews for 24 months unless cancelled in writing.", reason: "Long lock-in with a one-sided notice burden." },
  { severity: "high", clause: "Provider may modify fees at any time without notice.", reason: "Open-ended price changes with no cap or notice period." },
  { severity: "medium", clause: "Liability is not capped.", reason: "Exposure is unbounded; most contracts cap at fees paid." },
];

const edits = [
  { original: "auto-renews for 24 months", replacement: "renews for 12 months, with 30 days' written notice to cancel", reason: "Shorter term, fairer notice." },
  { original: "modify fees at any time without notice", replacement: "modify fees with 60 days' notice, capped at 5% per year", reason: "Predictable, bounded pricing." },
];

const sevStyles: Record<Severity, string> = {
  high: "border-silk-blush/50 bg-silk-blush/30 text-ink-800",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  low: "border-ink-900/10 bg-paper-100 text-ink-600",
};

const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
  { key: "summary", label: "Summary", icon: FileText },
  { key: "flags", label: "Red flags", icon: ShieldAlert },
  { key: "edits", label: "Suggested edits", icon: Wand2 },
];

const SAMPLE = `The Provider may modify fees at any time without notice. This agreement auto-renews for 24 months unless cancelled in writing. The Provider's liability is not capped. Only the Provider may terminate this agreement before the end of the term.`;

export function InteractiveContract() {
  const [text, setText] = useState(SAMPLE);
  const [status, setStatus] = useState<"idle" | "reviewing" | "done">("idle");
  const [tab, setTab] = useState<Tab>("summary");
  const [copied, setCopied] = useState<number | null>(null);

  function review() {
    setStatus("reviewing");
    setTimeout(() => { setStatus("done"); setTab("summary"); }, 1500);
  }
  function copyEdit(i: number, text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(i);
    setTimeout(() => setCopied((c) => (c === i ? null : c)), 1600);
  }

  return (
    <div>
      {status !== "done" && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            spellCheck={false}
            disabled={status === "reviewing"}
            className="w-full resize-none rounded-2xl border border-ink-900/[0.08] bg-paper-50/70 p-3.5 text-sm leading-relaxed text-ink-600 outline-none focus:ring-1 focus:ring-accent/40 disabled:opacity-60"
            aria-label="Contract text"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[11px] text-ink-400">For your review · 10–30 credits by length</span>
            <button
              onClick={review}
              disabled={status === "reviewing"}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-paper-50 transition-all hover:bg-ink-700 disabled:opacity-60"
            >
              <Sparkles className="h-3.5 w-3.5" /> {status === "reviewing" ? "Reviewing…" : "Review contract"}
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {status === "done" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
            <div className="mb-3 flex items-center gap-1.5">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active ? "text-paper-50" : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    {active && (
                      <motion.span layoutId="contract-tab" className="absolute inset-0 rounded-full bg-ink-900" transition={{ ease, duration: 0.35 }} />
                    )}
                    <Icon className="relative h-3.5 w-3.5" />
                    <span className="relative">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease }}
                className="space-y-2"
              >
                {tab === "summary" &&
                  summary.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-xl border border-ink-900/[0.06] bg-paper-50/70 px-3 py-2 text-xs text-ink-600">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-900/40" />
                      {s}
                    </div>
                  ))}

                {tab === "flags" &&
                  redFlags.map((f, i) => (
                    <div key={i} className="rounded-xl border border-ink-900/[0.06] bg-paper-50/70 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`chip text-[10px] ${sevStyles[f.severity]}`}>{f.severity} risk</span>
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-ink-800">“{f.clause}”</p>
                      <p className="mt-1 text-[11px] text-ink-500">{f.reason}</p>
                    </div>
                  ))}

                {tab === "edits" &&
                  edits.map((e, i) => (
                    <div key={i} className="rounded-xl border border-ink-900/[0.06] bg-paper-50/70 p-3">
                      <p className="text-[11px] text-ink-400 line-through">{e.original}</p>
                      <p className="mt-1 text-xs font-medium text-ink-800">{e.replacement}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-ink-500">{e.reason}</span>
                        <button
                          onClick={() => copyEdit(i, e.replacement)}
                          className="inline-flex items-center gap-1 rounded-full border border-ink-900/10 px-2.5 py-1 text-[11px] font-semibold text-ink-600 hover:text-ink-900"
                        >
                          {copied === i ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          {copied === i ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  ))}
              </motion.div>
            </AnimatePresence>

            <button
              onClick={() => setStatus("idle")}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900"
            >
              Review another
            </button>
            <p className="mt-2 text-[10px] text-ink-400">For your review — not legal advice.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
