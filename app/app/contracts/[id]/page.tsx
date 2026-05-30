"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Copy, Download, FileText, MessageCircle, ShieldAlert, Wand2 } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { PageHeader, Panel } from "@/components/app/ui";
import type { ContractReviewRow, RedFlag, SuggestedEdit } from "@/lib/db/schema";

const ease = [0.22, 1, 0.36, 1] as const;
type Tab = "summary" | "flags" | "edits" | "source";

function followupCost(q: string): number {
  const len = q.trim().length;
  if (len > 160) return 5;
  if (len > 70) return 4;
  return 3;
}

const sevStyles: Record<RedFlag["severity"], string> = {
  high: "border-silk-blush/50 bg-silk-blush/30 text-ink-800",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  low: "border-ink-900/10 bg-paper-100 text-ink-600",
};

const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
  { key: "summary", label: "Summary", icon: FileText },
  { key: "flags", label: "Red flags", icon: ShieldAlert },
  { key: "edits", label: "Suggested edits", icon: Wand2 },
  { key: "source", label: "Source", icon: FileText },
];

export default function ContractViewPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { remaining, refresh } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [row, setRow] = useState<ContractReviewRow | null>(null);
  const [tab, setTab] = useState<Tab>("summary");
  const [copied, setCopied] = useState<number | null>(null);

  const [followInput, setFollowInput] = useState("");
  const [followBusy, setFollowBusy] = useState(false);
  const [followups, setFollowups] = useState<{ q: string; a: string; cr: number }[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/contracts/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) {
          setError(data?.error || `Failed (${res.status})`);
          return;
        }
        setRow(data.contract);
      } catch (e) {
        if (alive) setError(String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  function copyEdit(i: number, val: string) {
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopied(i);
    setTimeout(() => setCopied((c) => (c === i ? null : c)), 1600);
  }

  async function askFollowup() {
    const q = followInput.trim();
    if (!q || !row?.sourceText || followupCost(q) > remaining) return;
    setFollowBusy(true);
    try {
      const res = await fetch("/api/ai/contract/followup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: row.sourceText, question: q }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setFollowups((f) => [{ q, a: data.answer, cr: data.credits }, ...f]);
      setFollowInput("");
      void refresh();
    } finally {
      setFollowBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel><p className="text-sm text-ink-500">Loading…</p></Panel>
      </div>
    );
  }
  if (error || !row) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/app/contracts" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Contracts
        </Link>
        <Panel className="!bg-rose-500/[0.06]">
          <p className="text-sm text-rose-700">{error ?? "Review not found."}</p>
        </Panel>
      </div>
    );
  }

  const redFlags = row.redFlags as RedFlag[];
  const suggestedEdits = row.suggestedEdits as SuggestedEdit[];
  const summary = row.summary as string[];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/contracts" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Contracts
      </Link>

      <PageHeader
        title={row.title}
        subtitle="For your review — not legal advice."
        action={
          <a
            href={`/api/contracts/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-soft py-2 text-[12px]"
          >
            <Download className="h-3.5 w-3.5" /> Export PDF
          </a>
        }
      />

      <div className="mb-4 flex items-center gap-1.5">
        {tabs.filter((t) => t.key !== "source" || row.sourceText).map((t) => {
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
              {active && <motion.span layoutId="contract-view-tab" className="absolute inset-0 rounded-full bg-ink-900" transition={{ ease, duration: 0.35 }} />}
              <Icon className="relative h-3.5 w-3.5" />
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
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
              (summary.length ? (
                summary.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-ink-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-900/40" />
                    {s}
                  </div>
                ))
              ) : (
                <p className="text-xs text-ink-400">No summary returned.</p>
              ))}

            {tab === "flags" &&
              (redFlags.length ? (
                redFlags.map((f, i) => (
                  <div key={i} className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-3.5">
                    <span className={`chip text-[10px] ${sevStyles[f.severity]}`}>{f.severity} risk</span>
                    <p className="mt-2 text-sm font-medium text-ink-800">“{f.clause}”</p>
                    <p className="mt-1 text-xs text-ink-500">{f.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-ink-400">No red flags found.</p>
              ))}

            {tab === "edits" &&
              (suggestedEdits.length ? (
                suggestedEdits.map((e, i) => (
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
                ))
              ) : (
                <p className="text-xs text-ink-400">No suggested edits.</p>
              ))}

            {tab === "source" && (
              <pre className="whitespace-pre-wrap break-words rounded-xl bg-paper-50/70 p-3 font-mono text-[11px] leading-relaxed text-ink-600">
                {row.sourceText || "(not stored)"}
              </pre>
            )}
          </motion.div>
        </AnimatePresence>
      </Panel>

      {row.sourceText && (
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
      )}
    </div>
  );
}
