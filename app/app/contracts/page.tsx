"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Copy, Download, FileText, MessageCircle, ShieldAlert, Sparkles, Wand2 } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { CostBadge, PageHeader, Panel } from "@/components/app/ui";
import { relativeTime } from "@/lib/app/format";
import type { RedFlag, SuggestedEdit } from "@/lib/db/schema";

const ease = [0.22, 1, 0.36, 1] as const;
type Severity = "high" | "medium" | "low";
type Tab = "summary" | "flags" | "edits";

const MAX_CHARS = 60000;

function followupCost(q: string): number {
  const len = q.trim().length;
  if (len > 160) return 5;
  if (len > 70) return 4;
  return 3;
}

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

interface ReviewOutput {
  id: string;
  summary: string[];
  redFlags: RedFlag[];
  suggestedEdits: SuggestedEdit[];
}

const SAMPLE = `MASTER SERVICES AGREEMENT

1. Fees. The Provider may modify fees at any time without notice.
2. Term. This agreement auto-renews for 24 months unless cancelled in writing.
3. Liability. The Provider's liability is not capped.
4. Termination. Only the Provider may terminate this agreement before the end of the term.
5. Governing law. This agreement is governed by the laws of the Provider's home jurisdiction.`;

interface RecentContract { id: string; title: string; createdAt: string }

export default function ContractToolPage() {
  const { remaining, addRecent, refresh } = useApp();
  const [text, setText] = useState(SAMPLE);
  const [status, setStatus] = useState<"idle" | "reviewing" | "done">("idle");
  const [tab, setTab] = useState<Tab>("summary");
  const [copied, setCopied] = useState<number | null>(null);
  const [review, setReview] = useState<ReviewOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentContract[]>([]);

  useEffect(() => {
    void fetch("/api/contracts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setRecent(d.items?.slice(0, 5) ?? []))
      .catch(() => {});
  }, []);

  const [followups, setFollowups] = useState<{ q: string; a: string; cr: number }[]>([]);
  const [followInput, setFollowInput] = useState("");
  const [followBusy, setFollowBusy] = useState(false);

  const tooLong = text.length > MAX_CHARS;
  const cost = Math.min(30, Math.max(10, 10 + Math.floor(text.length / 2500)));
  const blocked = cost > remaining;

  async function doReview() {
    if (tooLong || blocked || !text.trim()) return;
    setStatus("reviewing");
    setError(null);
    try {
      const res = await fetch("/api/ai/contract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(serverError(data, res.status));
        setStatus("idle");
        return;
      }
      setReview({ id: data.id, summary: data.summary, redFlags: data.redFlags, suggestedEdits: data.suggestedEdits });
      setStatus("done");
      setTab("summary");
      addRecent({ kind: "contract", title: "Contract review", status: "in_review" });
      void refresh();
    } catch (e) {
      setError(String(e));
      setStatus("idle");
    }
  }

  function copyEdit(i: number, val: string) {
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopied(i);
    setTimeout(() => setCopied((c) => (c === i ? null : c)), 1600);
  }

  async function askFollowup() {
    const q = followInput.trim();
    if (!q || followupCost(q) > remaining) return;
    setFollowBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/contract/followup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, question: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(serverError(data, res.status));
        return;
      }
      setFollowups((f) => [{ q, a: data.answer, cr: data.credits }, ...f]);
      setFollowInput("");
      void refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setFollowBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Contract review"
        subtitle="Paste a contract and Rufus returns a plain-English summary, red flags, and suggested edits. For your review — not legal advice."
      />

      {error && (
        <Panel className="mb-5 !bg-rose-500/[0.06]">
          <p className="text-sm text-rose-700">{error}</p>
        </Panel>
      )}

      {status === "idle" && recent.length > 0 && (
        <Panel className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-ink-900">Recent reviews</h3>
          </div>
          <div className="space-y-1">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/app/contracts/${r.id}`}
                className="group flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-paper-100"
              >
                <span className="truncate text-sm text-ink-700">{r.title}</span>
                <span className="flex shrink-0 items-center gap-2 text-[11px] text-ink-400">
                  {relativeTime(+new Date(r.createdAt))}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </Link>
            ))}
          </div>
        </Panel>
      )}

      {status !== "done" && (
        <Panel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            spellCheck={false}
            disabled={status === "reviewing"}
            className="input resize-none font-mono text-xs leading-relaxed disabled:opacity-60"
            placeholder="Paste the contract text…"
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
              onClick={doReview}
              disabled={status === "reviewing" || tooLong || blocked || !text.trim()}
              className="btn-dark py-2.5 text-[13px] disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" /> {status === "reviewing" ? "Reviewing…" : blocked ? "Not enough credits" : "Review contract"}
            </button>
          </div>
        </Panel>
      )}

      {status === "done" && review && (
        <Panel className="mb-4 !bg-emerald-500/[0.06]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink-700">Saved · you can reopen this review any time.</p>
            <Link href={`/app/contracts/${review.id}`} className="btn-soft py-2 text-[12px]">
              Open as page <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Panel>
      )}

      <AnimatePresence>
        {status === "done" && review && (
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
                <button onClick={() => { setStatus("idle"); setReview(null); setFollowups([]); }} className="btn-soft py-2 text-[12px]">
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
                    review.summary.map((s, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-ink-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-900/40" />
                        {s}
                      </div>
                    ))}

                  {tab === "flags" &&
                    review.redFlags.map((f, i) => (
                      <div key={i} className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-3.5">
                        <span className={`chip text-[10px] ${sevStyles[f.severity]}`}>{f.severity} risk</span>
                        <p className="mt-2 text-sm font-medium text-ink-800">“{f.clause}”</p>
                        <p className="mt-1 text-xs text-ink-500">{f.reason}</p>
                      </div>
                    ))}

                  {tab === "edits" &&
                    review.suggestedEdits.map((e, i) => (
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

                  {tab === "summary" && review.summary.length === 0 && (
                    <p className="text-xs text-ink-400">No summary returned.</p>
                  )}
                  {tab === "flags" && review.redFlags.length === 0 && (
                    <p className="text-xs text-ink-400">No red flags found.</p>
                  )}
                  {tab === "edits" && review.suggestedEdits.length === 0 && (
                    <p className="text-xs text-ink-400">No suggested edits.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </Panel>

            {/* Follow-ups against the cached contract */}
            <Panel className="mt-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-ink-900">Ask about this contract</h3>
              </div>
              <p className="mt-1 text-xs text-ink-500">
                The contract stays cached — follow-ups cost less than a fresh review.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  value={followInput}
                  onChange={(e) => setFollowInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), askFollowup())}
                  placeholder="e.g. What does the renewal clause mean?"
                  disabled={followBusy}
                  className="input flex-1 text-sm"
                />
                <button
                  onClick={askFollowup}
                  disabled={!followInput.trim() || followBusy || followupCost(followInput) > remaining}
                  className="btn-dark py-2.5 text-[13px] disabled:opacity-50"
                >
                  Ask · {followupCost(followInput || "x")}cr
                </button>
              </div>

              {followBusy && (
                <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
                  <span className="flex h-3 items-center gap-[3px]">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="w-[3px] rounded-full bg-gradient-to-b from-silk-peri to-silk-blush animate-eq"
                        style={{ height: "100%", animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </span>
                  Recalling the contract…
                </div>
              )}

              <AnimatePresence>
                {followups.map((f, i) => (
                  <motion.div
                    key={`${f.q}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ease, duration: 0.35 }}
                    className="mt-3 rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-semibold text-ink-800">{f.q}</span>
                      <span className="chip shrink-0 text-[10px]">{f.cr}cr</span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-ink-600">{f.a}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Panel>

            <p className="mt-3 text-xs text-ink-400">For your review — not legal advice.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function serverError(data: { error?: string; detail?: string }, status: number): string {
  switch (data?.error) {
    case "ai_not_configured":
      return "AI isn't configured yet — set ANTHROPIC_API_KEY on Vercel to enable generation.";
    case "insufficient_credits":
      return "Not enough credits. Top up in Settings.";
    case "too_long":
      return "Contract is too long. Trim it or split into sections.";
    case "ai_failed":
      return `AI call failed: ${data.detail ?? "unknown"}`;
    default:
      return `Request failed (${status}). ${data?.error ?? ""}`.trim();
  }
}
