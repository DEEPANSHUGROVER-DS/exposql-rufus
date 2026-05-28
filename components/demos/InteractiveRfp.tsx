"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import { rfpQuestionCost } from "@/lib/pricing";

const ease = [0.22, 1, 0.36, 1] as const;

type Confidence = "high" | "medium" | "low";

interface Answer {
  question: string;
  answer: string;
  confidence: Confidence;
  source: string | null;
  approved: boolean;
}

const SAMPLE = `Where is customer data hosted?
Do you encrypt data at rest?
What is your uptime SLA?
Have you completed a SOC 2 audit?`;

// Pretend "knowledge base" lookups keyed by question intent.
const KB: { match: RegExp; answer: string; confidence: Confidence; source: string | null }[] = [
  { match: /host|data center|region/i, answer: "All customer data is hosted on AWS in the eu-west-1 (Ireland) region, with encrypted backups in eu-central-1.", confidence: "high", source: "Security overview" },
  { match: /encrypt/i, answer: "Yes. Data is encrypted at rest with AES-256 and in transit with TLS 1.2+.", confidence: "high", source: "Data retention policy" },
  { match: /uptime|sla|availability/i, answer: "We target 99.9% monthly uptime, with service credits defined in the SLA for any shortfall.", confidence: "medium", source: "SLA terms" },
  { match: /soc ?2|iso|audit|certif/i, answer: "", confidence: "low", source: null },
];

function lookup(q: string): Omit<Answer, "question" | "approved"> {
  const hit = KB.find((k) => k.match.test(q));
  if (!hit || !hit.answer) {
    return { answer: "No source found — please review and add this to your knowledge base.", confidence: "low", source: null };
  }
  return { answer: hit.answer, confidence: hit.confidence, source: hit.source };
}

const confStyles: Record<Confidence, string> = {
  high: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  low: "border-silk-blush/50 bg-silk-blush/30 text-ink-700",
};

export function InteractiveRfp() {
  const [text, setText] = useState(SAMPLE);
  const [answers, setAnswers] = useState<Answer[] | null>(null);
  const [busy, setBusy] = useState(false);

  function run() {
    const questions = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!questions.length) return;
    setBusy(true);
    setAnswers(null);
    setTimeout(() => {
      setAnswers(questions.map((q) => ({ question: q, approved: false, ...lookup(q) })));
      setBusy(false);
    }, 1300);
  }
  function approve(i: number) {
    setAnswers((a) => (a ? a.map((x, j) => (j === i ? { ...x, approved: !x.approved } : x)) : a));
  }

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const questionCount = lines.length;
  const credits = lines.reduce((s, q) => s + rfpQuestionCost(q), 0);

  return (
    <div>
      {!answers && !busy && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            spellCheck={false}
            className="w-full resize-none rounded-2xl border border-ink-900/[0.08] bg-paper-50/70 p-3.5 text-sm text-ink-700 outline-none focus:ring-1 focus:ring-accent/40"
            placeholder="Paste the RFP or a list of questions, one per line…"
            aria-label="RFP questions"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[11px] text-ink-400">
              {questionCount} question{questionCount === 1 ? "" : "s"} · {credits} credit{credits === 1 ? "" : "s"}
            </span>
            <button
              onClick={run}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-paper-50 transition-all hover:bg-ink-700"
            >
              <Sparkles className="h-3.5 w-3.5" /> Auto-answer
            </button>
          </div>
        </>
      )}

      {busy && (
        <div className="flex items-center gap-3 rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-4 text-sm text-ink-500">
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
      )}

      <AnimatePresence>
        {answers && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
            {answers.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, ease }}
                className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-ink-800">{a.question}</span>
                  <span className={`chip shrink-0 text-[10px] ${confStyles[a.confidence]}`}>{a.confidence}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-600">{a.answer}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-ink-400">
                    {a.source ? <>Source: <span className="font-medium text-ink-600">{a.source}</span></> : "⚑ Flagged for review"}
                  </span>
                  <button
                    onClick={() => approve(i)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      a.approved ? "bg-emerald-500 text-white" : "border border-ink-900/10 text-ink-600 hover:text-ink-900"
                    }`}
                  >
                    <Check className="h-3 w-3" /> {a.approved ? "Approved" : "Approve"}
                  </button>
                </div>
              </motion.div>
            ))}
            <button
              onClick={() => setAnswers(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Edit questions
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
