"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Copy, Plus, RotateCcw } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { PageHeader, Panel } from "@/components/app/ui";
import { rfpQuestionCost } from "@/lib/pricing";
import type { RfpAnswer, RfpResponseRow } from "@/lib/db/schema";

const ease = [0.22, 1, 0.36, 1] as const;
type Confidence = "high" | "medium" | "low";

const confStyles: Record<Confidence, string> = {
  high: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  low: "border-silk-blush/50 bg-silk-blush/30 text-ink-700",
};

export default function RfpViewPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { knowledge, addKnowledge, refresh } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [row, setRow] = useState<RfpResponseRow | null>(null);
  const [answers, setAnswers] = useState<RfpAnswer[]>([]);
  const [copied, setCopied] = useState(false);
  const [busyIndex, setBusyIndex] = useState<number | null>(null);

  const patchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const kbTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const k of knowledge) m.set(k.id, k.title);
    return m;
  }, [knowledge]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/rfp/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) {
          setError(data?.error || `Failed (${res.status})`);
          return;
        }
        setRow(data.rfp);
        setAnswers(data.rfp.answers as RfpAnswer[]);
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

  const scheduleSave = useCallback((next: RfpAnswer[]) => {
    if (patchTimer.current) clearTimeout(patchTimer.current);
    patchTimer.current = setTimeout(() => {
      void fetch(`/api/rfp/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: next }),
      });
    }, 700);
  }, [id]);

  function setAnswersAndSave(updater: (prev: RfpAnswer[]) => RfpAnswer[]) {
    setAnswers((prev) => {
      const next = updater(prev);
      scheduleSave(next);
      return next;
    });
  }

  function editAnswer(i: number, val: string) {
    setAnswersAndSave((prev) => prev.map((x, j) => (j === i ? { ...x, answer: val } : x)));
  }
  function toggleApprove(i: number) {
    setAnswersAndSave((prev) => prev.map((x, j) => (j === i ? { ...x, approved: !x.approved } : x)));
  }
  function addFact(q: string) {
    addKnowledge({ title: q.replace(/\?$/, ""), body: "", tags: ["rfp"] });
  }
  function copyAll() {
    const txt = answers.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n");
    navigator.clipboard?.writeText(txt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function reAnswer(i: number) {
    const q = answers[i]?.question;
    if (!q) return;
    setBusyIndex(i);
    try {
      const res = await fetch("/api/ai/rfp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: q }),
      });
      const data = await res.json();
      if (!res.ok) return;
      const fresh: Omit<RfpAnswer, "approved"> | undefined = data.answers?.[0];
      if (!fresh) return;
      setAnswersAndSave((prev) => prev.map((x, j) => (j === i ? { ...fresh, approved: false } : x)));
      void refresh();
    } finally {
      setBusyIndex(null);
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
        <Link href="/app/rfp" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> RFP
        </Link>
        <Panel className="!bg-rose-500/[0.06]">
          <p className="text-sm text-rose-700">{error ?? "Response not found."}</p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/rfp" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> RFP
      </Link>

      <PageHeader
        title={row.title}
        subtitle={`${answers.length} question${answers.length === 1 ? "" : "s"} · edits autosave`}
        action={
          <button onClick={copyAll} className="btn-soft py-2 text-[12px]">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy all"}
          </button>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-ink-500">
          {answers.filter((a) => a.approved).length}/{answers.length} approved
        </span>
      </div>

      <div className="space-y-3">
        {answers.map((a, i) => {
          const sourceTitle = a.sourceEntryId ? kbTitleById.get(a.sourceEntryId) : null;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, ease }}>
              <Panel className="!p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-ink-800">{a.question}</span>
                  <span className={`chip shrink-0 text-[10px] ${confStyles[a.confidence]}`}>{a.confidence}</span>
                </div>
                <textarea
                  value={a.answer}
                  onChange={(e) => editAnswer(i, e.target.value)}
                  rows={3}
                  className="input mt-2 resize-none text-xs"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-ink-400">
                    {sourceTitle ? (
                      <>Source: <span className="font-medium text-ink-600">{sourceTitle}</span></>
                    ) : a.sourceEntryId ? (
                      <>Source: <span className="font-medium text-ink-600">(deleted)</span></>
                    ) : (
                      <button onClick={() => addFact(a.question)} className="inline-flex items-center gap-1 font-semibold text-accent">
                        <Plus className="h-3 w-3" /> Add fact to knowledge base
                      </button>
                    )}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => reAnswer(i)}
                      disabled={busyIndex === i}
                      className="inline-flex items-center gap-1 rounded-full border border-ink-900/10 px-2.5 py-1 text-[11px] font-semibold text-ink-600 hover:text-ink-900 disabled:opacity-50"
                    >
                      <RotateCcw className="h-3 w-3" /> {busyIndex === i ? "…" : `Re-answer · ${rfpQuestionCost(a.question)}cr`}
                    </button>
                    <button
                      onClick={() => toggleApprove(i)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        a.approved ? "bg-emerald-500 text-white" : "border border-ink-900/10 text-ink-600 hover:text-ink-900"
                      }`}
                    >
                      <Check className="h-3 w-3" /> {a.approved ? "Approved" : "Approve"}
                    </button>
                  </div>
                </div>
              </Panel>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence />
    </div>
  );
}
