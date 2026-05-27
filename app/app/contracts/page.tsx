"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Download, FileText, ShieldAlert, Sparkles, Wand2 } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { CostBadge, PageHeader, Panel } from "@/components/app/ui";

const ease = [0.22, 1, 0.36, 1] as const;
type Severity = "high" | "medium" | "low";
type Tab = "summary" | "flags" | "edits";

const MAX_CHARS = 60000;

const summary = [
  "Fees: the provider may change pricing during the term.",
  "Term: the agreement renews automatically for 24 months.",
  "Liability: no cap on the provider's liability is specified.",
  "Termination: only the provider may terminate early.",
  "Confidentiality: mutual, surviving 3 years after termination.",
];

const redFlags: { severity: Severity; clause: string; reason: string }[] = [
  { severity: "high", clause: "Auto-renews for 24 months unless cancelled in writing.", reason: "Long lock-in with a one-sided notice burden on you." },
  { severity: "high", clause: "Provider may modify fees at any time without notice.", reason: "Open-ended price changes with no cap or notice period." },
  { severity: "medium", clause: "Provider's liability is not capped.", reason: "Exposure is unbounded; most contracts cap at fees paid." },
  { severity: "low", clause: "Governing law is the provider's home jurisdiction.", reason: "May be inconvenient if a dispute arises." },
];

const edits = [
  { original: "auto-renews for 24 months", replacement: "renews for 12 months, with 30 days' written notice to cancel", reason: "Shorter term, fairer notice." },
  { original: "modify fees at any time without notice", replacement: "modify fees with 60 days' notice, capped at 5% per year", reason: "Predictable, bounded pricing." },
  { original: "liability is not capped", replacement: "total liability is capped at the fees paid in the prior 12 months", reason: "Bounds your downside." },
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

const SAMPLE = `MASTER SERVICES AGREEMENT

1. Fees. The Provider may modify fees at any time without notice.
2. Term. This agreement auto-renews for 24 months unless cancelled in writing.
3. Liability. The Provider's liability is not capped.
4. Termination. Only the Provider may terminate this agreement before the end of the term.
5. Governing law. This agreement is governed by the laws of the Provider's home jurisdiction.`;

export default function ContractToolPage() {
  const { spend, remaining, addRecent } = useApp();
  const [text, setText] = useState(SAMPLE);
  const [status, setStatus] = useState<"idle" | "reviewing" | "done">("idle");
  const [tab, setTab] = useState<Tab>("summary");
  const [copied, setCopied] = useState<number | null>(null);

  const tooLong = text.length > MAX_CHARS;
  const cost = Math.min(30, Math.max(10, 10 + Math.floor(text.length / 2500)));
  const blocked = cost > remaining;

  function review() {
    if (tooLong || blocked || !text.trim()) return;
    if (!spend(cost, "Contract review")) return;
    setStatus("reviewing");
    setTimeout(() => {
      setStatus("done");
      setTab("summary");
      addRecent({ kind: "contract", title: "Contract review", status: "in_review" });
    }, 1500);
  }

  function copyEdit(i: number, val: string) {
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopied(i);
    setTimeout(() => setCopied((c) => (c === i ? null : c)), 1600);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Contract review"
        subtitle="Paste a contract and Rufus returns a plain-English summary, red flags, and suggested edits. For your review — not legal advice."
      />

      {status !== "done" && (
        <Panel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            spellCheck={false}
            disabled={status === "reviewing"}
            className="input resize-none font-mono text-xs leading-relaxed disabled:opacity-60"
            placeholder="Paste the contract text (or upload a PDF/DOCX once the backend is connected)…"
          />
          {tooLong && (
            <p className="mt-2 text-xs font-medium text-rose-600">
              This contract is long ({text.length.toLocaleString()} chars). Trim it or review it section by section.
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-ink-400">
              <CostBadge label={`${cost} credits`} />
              <span>By document length</span>
            </div>
            <button
              onClick={review}
              disabled={status === "reviewing" || tooLong || blocked || !text.trim()}
              className="btn-dark py-2.5 text-[13px] disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" /> {status === "reviewing" ? "Reviewing…" : blocked ? "Not enough credits" : "Review contract"}
            </button>
          </div>
        </Panel>
      )}

      <AnimatePresence>
        {status === "done" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
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
                      {active && <motion.span layoutId="contract-tool-tab" className="absolute inset-0 rounded-full bg-ink-900" transition={{ ease, duration: 0.35 }} />}
                      <Icon className="relative h-3.5 w-3.5" />
                      <span className="relative">{t.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button className="btn-soft py-2 text-[12px]" onClick={() => {}}>
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </button>
                <button onClick={() => setStatus("idle")} className="btn-soft py-2 text-[12px]">
                  Review another
                </button>
              </div>
            </div>

            <Panel>
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease }}
                  className="space-y-2.5"
                >
                  {tab === "summary" &&
                    summary.map((s, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-ink-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-900/40" />
                        {s}
                      </div>
                    ))}

                  {tab === "flags" &&
                    redFlags.map((f, i) => (
                      <div key={i} className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-3.5">
                        <span className={`chip text-[10px] ${sevStyles[f.severity]}`}>{f.severity} risk</span>
                        <p className="mt-2 text-sm font-medium text-ink-800">“{f.clause}”</p>
                        <p className="mt-1 text-xs text-ink-500">{f.reason}</p>
                      </div>
                    ))}

                  {tab === "edits" &&
                    edits.map((e, i) => (
                      <div key={i} className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-3.5">
                        <p className="text-xs text-ink-400 line-through">{e.original}</p>
                        <p className="mt-1 text-sm font-medium text-ink-800">{e.replacement}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-xs text-ink-500">{e.reason}</span>
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
            </Panel>
            <p className="mt-3 text-xs text-ink-400">For your review — not legal advice.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
