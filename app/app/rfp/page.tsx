"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Copy, ListChecks, Plus, RotateCcw, Sparkles } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { CostBadge, PageHeader, Panel } from "@/components/app/ui";
import { rfpQuestionCost } from "@/lib/pricing";
import { relativeTime } from "@/lib/app/format";

const ease = [0.22, 1, 0.36, 1] as const;
type Confidence = "high" | "medium" | "low";

interface Answer {
  question: string;
  answer: string;
  confidence: Confidence;
  sourceEntryId: string | null;
  approved: boolean;
}

const confStyles: Record<Confidence, string> = {
  high: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  low: "border-silk-blush/50 bg-silk-blush/30 text-ink-700",
};

const SAMPLE = `Where is customer data hosted?
Do you encrypt data at rest?
What is your uptime SLA?
Have you completed a SOC 2 audit?
Tell us about your company background.`;

interface RecentRfp { id: string; title: string; updatedAt: string }

export default function RfpToolPage() {
  const { knowledge, remaining, addKnowledge, addRecent, refresh } = useApp();
  const [text, setText] = useState(SAMPLE);
  const [answers, setAnswers] = useState<Answer[] | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentRfp[]>([]);

  useEffect(() => {
    void fetch("/api/rfp", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setRecent(d.items?.slice(0, 5) ?? []))
      .catch(() => {});
  }, []);

  const questions = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const cost = questions.reduce((s, q) => s + rfpQuestionCost(q), 0);
  const blocked = cost > remaining;
  const emptyKb = knowledge.length === 0;

  const kbTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const k of knowledge) m.set(k.id, k.title);
    return m;
  }, [knowledge]);

  async function run() {
    if (!questions.length || blocked || emptyKb) return;
    setBusy(true);
    setError(null);
    setAnswers(null);
    try {
      const res = await fetch("/api/ai/rfp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(serverError(data, res.status));
        return;
      }
      setAnswers(
        (data.answers ?? []).map((a: Omit<Answer, "approved">) => ({ ...a, approved: false })),
      );
      setSavedId(data.id ?? null);
      addRecent({ kind: "rfp", title: `RFP — ${questions.length} questions`, status: "completed" });
      void refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function reAnswer(i: number) {
    const q = answers?.[i]?.question;
    if (!q) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/rfp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(serverError(data, res.status));
        return;
      }
      const fresh: Omit<Answer, "approved"> | undefined = data.answers?.[0];
      if (!fresh) return;
      setAnswers((a) =>
        a ? a.map((x, j) => (j === i ? { ...fresh, approved: false } : x)) : a,
      );
      void refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  function approve(i: number) {
    setAnswers((a) => (a ? a.map((x, j) => (j === i ? { ...x, approved: !x.approved } : x)) : a));
  }
  function edit(i: number, val: string) {
    setAnswers((a) => (a ? a.map((x, j) => (j === i ? { ...x, answer: val } : x)) : a));
  }
  function addFact(q: string) {
    addKnowledge({ title: q.replace(/\?$/, ""), body: "", tags: ["rfp"] });
  }
  function copyAll() {
    if (!answers) return;
    const txt = answers.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n");
    navigator.clipboard?.writeText(txt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="RFP autopilot"
        subtitle="Paste an RFP or questionnaire. Rufus answers each question from your knowledge base — with a confidence score and source."
      />

      {emptyKb && (
        <Panel className="mb-5 border-amber-500/30 !bg-amber-500/[0.06]">
          <p className="text-sm font-medium text-ink-800">Your knowledge base is empty.</p>
          <p className="mt-1 text-sm text-ink-500">Add a few entries first so Rufus has something to answer from.</p>
          <a href="/app/knowledge" className="btn-dark mt-4 py-2.5 text-[13px]">Add knowledge</a>
        </Panel>
      )}

      {error && (
        <Panel className="mb-5 !bg-rose-500/[0.06]">
          <p className="text-sm text-rose-700">{error}</p>
        </Panel>
      )}

      {!answers && recent.length > 0 && (
        <Panel className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-ink-900">Recent responses</h3>
          </div>
          <div className="space-y-1">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/app/rfp/${r.id}`}
                className="group flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-paper-100"
              >
                <span className="truncate text-sm text-ink-700">{r.title}</span>
                <span className="flex shrink-0 items-center gap-2 text-[11px] text-ink-400">
                  {relativeTime(+new Date(r.updatedAt))}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </Link>
            ))}
          </div>
        </Panel>
      )}

      {answers && savedId && (
        <Panel className="mb-4 !bg-emerald-500/[0.06]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink-700">Saved · you can reopen this response any time.</p>
            <Link href={`/app/rfp/${savedId}`} className="btn-soft py-2 text-[12px]">
              Open as page <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Panel>
      )}

      {!answers && !busy && (
        <Panel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            spellCheck={false}
            className="input resize-none"
            placeholder="Paste the RFP, or list questions one per line…"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-ink-400">
              <CostBadge label={`${cost} credit${cost === 1 ? "" : "s"}`} />
              <span>
                {questions.length} question{questions.length === 1 ? "" : "s"} · 2–4 credits each, by complexity
              </span>
            </div>
            <button onClick={run} disabled={!cost || blocked || emptyKb} className="btn-dark py-2.5 text-[13px] disabled:opacity-50">
              <Sparkles className="h-4 w-4" /> {blocked ? "Not enough credits" : "Auto-answer"}
            </button>
          </div>
        </Panel>
      )}

      {busy && (
        <Panel>
          <div className="flex items-center gap-3 text-sm text-ink-500">
            <span className="flex h-4 items-center gap-[3px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-[3px] origin-center rounded-full bg-gradient-to-b from-silk-peri to-silk-blush animate-eq"
                  style={{ height: "100%", animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </span>
            Drafting answers from your knowledge base…
          </div>
        </Panel>
      )}

      <AnimatePresence>
        {answers && !busy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-500">
                {answers.filter((a) => a.approved).length}/{answers.length} approved
              </span>
              <div className="flex gap-2">
                <button onClick={copyAll} className="btn-soft py-2 text-[12px]">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy all"}
                </button>
                <button onClick={() => setAnswers(null)} className="btn-soft py-2 text-[12px]">
                  <RotateCcw className="h-3.5 w-3.5" /> Edit questions
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {answers.map((a, i) => {
                const sourceTitle = a.sourceEntryId ? kbTitleById.get(a.sourceEntryId) : null;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, ease }}
                  >
                    <Panel className="!p-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-ink-800">{a.question}</span>
                        <span className={`chip shrink-0 text-[10px] ${confStyles[a.confidence]}`}>{a.confidence}</span>
                      </div>
                      <textarea
                        value={a.answer}
                        onChange={(e) => edit(i, e.target.value)}
                        rows={3}
                        className="input mt-2 resize-none text-xs"
                      />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-ink-400">
                          {sourceTitle ? (
                            <>Source: <span className="font-medium text-ink-600">{sourceTitle}</span></>
                          ) : (
                            <button onClick={() => addFact(a.question)} className="inline-flex items-center gap-1 font-semibold text-accent">
                              <Plus className="h-3 w-3" /> Add fact to knowledge base
                            </button>
                          )}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => reAnswer(i)}
                            className="rounded-full border border-ink-900/10 px-2.5 py-1 text-[11px] font-semibold text-ink-600 hover:text-ink-900"
                          >
                            Re-answer · {rfpQuestionCost(a.question)}cr
                          </button>
                          <button
                            onClick={() => approve(i)}
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
    case "empty_knowledge_base":
      return "Your knowledge base is empty. Add a few entries first.";
    case "insufficient_credits":
      return "Not enough credits. Top up in Settings.";
    case "unauthenticated":
      return "Please sign in again.";
    case "ai_failed":
      return `AI call failed: ${data.detail ?? "unknown"}`;
    default:
      return `Request failed (${status}). ${data?.error ?? ""}`.trim();
  }
}
