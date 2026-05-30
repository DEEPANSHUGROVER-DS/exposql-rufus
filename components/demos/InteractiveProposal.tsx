"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Sparkles, Trash2 } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;
const tones = ["Formal", "Friendly", "Concise"] as const;

interface Row {
  id: number;
  item: string;
  qty: number;
  price: number;
}

const sections = ["Overview", "Objectives", "Scope of work", "Deliverables", "Timeline", "Pricing", "Terms", "Next steps"];

let nextId = 4;

export function InteractiveProposal() {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, item: "Discovery & strategy", qty: 1, price: 4000 },
    { id: 2, item: "Design system", qty: 1, price: 6500 },
    { id: 3, item: "Build & launch", qty: 1, price: 12000 },
  ]);
  const [tone, setTone] = useState<(typeof tones)[number]>("Friendly");
  const [status, setStatus] = useState<"idle" | "drafting" | "done">("idle");

  const total = useMemo(() => rows.reduce((s, r) => s + r.qty * r.price, 0), [rows]);
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  function update(id: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setStatus("idle");
  }
  function addRow() {
    setRows((rs) => [...rs, { id: nextId++, item: "New line item", qty: 1, price: 1000 }]);
    setStatus("idle");
  }
  function removeRow(id: number) {
    setRows((rs) => rs.filter((r) => r.id !== id));
    setStatus("idle");
  }
  function generate() {
    setStatus("drafting");
    setTimeout(() => setStatus("done"), 1500);
  }

  return (
    <div>
      {/* tone */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-ink-400">Tone</span>
        {tones.map((t) => (
          <button
            key={t}
            onClick={() => { setTone(t); setStatus("idle"); }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              tone === t ? "bg-ink-900 text-paper-50" : "border border-ink-900/10 bg-paper-50 text-ink-600 hover:text-ink-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* editable pricing table */}
      <div className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-3">
        <div className="space-y-1.5">
          {rows.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ ease }}
              className="group flex items-center gap-2 rounded-xl bg-white px-2.5 py-1.5"
            >
              <input
                value={r.item}
                onChange={(e) => update(r.id, { item: e.target.value })}
                className="min-w-0 flex-1 bg-transparent text-sm text-ink-700 outline-none focus:text-ink-900"
                aria-label="Line item description"
              />
              <input
                type="number"
                min={1}
                value={r.qty}
                onChange={(e) => update(r.id, { qty: Math.max(1, Number(e.target.value) || 0) })}
                className="w-10 rounded-md bg-paper-100 px-1.5 py-1 text-center text-xs text-ink-700 outline-none focus:ring-1 focus:ring-accent/40"
                aria-label="Quantity"
              />
              <div className="flex items-center text-sm font-semibold text-ink-900">
                <span className="text-ink-400">$</span>
                <input
                  type="number"
                  min={0}
                  value={r.price}
                  onChange={(e) => update(r.id, { price: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-16 bg-transparent text-right outline-none focus:text-accent"
                  aria-label="Unit price"
                />
              </div>
              <button
                onClick={() => removeRow(r.id)}
                className="opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove line"
              >
                <Trash2 className="h-3.5 w-3.5 text-ink-400 hover:text-ink-900" />
              </button>
            </motion.div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-900"
        >
          <Plus className="h-3.5 w-3.5" /> Add line item
        </button>

        <motion.div layout className="mt-2 flex items-center justify-between rounded-xl bg-ink-900 px-3 py-2.5 text-sm text-paper-50">
          <span>Total</span>
          <motion.span key={total} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-semibold">
            {fmt(total)}
          </motion.span>
        </motion.div>
      </div>

      {/* generate */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-ink-400">12–20 credits · {tone.toLowerCase()} tone</span>
        <button
          onClick={generate}
          disabled={status === "drafting"}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-paper-50 transition-all hover:bg-ink-700 disabled:opacity-60"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {status === "drafting" ? "Drafting…" : status === "done" ? "Regenerate" : "Generate proposal"}
        </button>
      </div>

      <AnimatePresence>
        {status === "done" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ ease, duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-2xl border border-ink-900/[0.06] bg-white p-3.5">
              <div className="flex flex-wrap gap-1.5">
                {sections.map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, ease }}
                    className="chip text-[10px]"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Check className="h-3.5 w-3.5" /> Branded & ready to send
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
