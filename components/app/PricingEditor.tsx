"use client";

import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import type { PricingRow } from "@/lib/db/schema";

let nextId = 1000;

export function PricingEditor({
  rows,
  setRows,
  currency = "USD",
}: {
  rows: PricingRow[];
  setRows: React.Dispatch<React.SetStateAction<PricingRow[]>>;
  currency?: string;
}) {
  const total = rows.reduce((s, r) => s + r.qty * r.price, 0);
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 });

  return (
    <div className="rounded-2xl border border-ink-900/[0.06] bg-paper-50/70 p-3">
      <div className="space-y-1.5">
        {rows.map((r) => (
          <motion.div key={r.id} layout className="group flex items-center gap-2 rounded-xl bg-white px-2.5 py-1.5">
            <input
              value={r.item}
              onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, item: e.target.value } : x)))}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink-700 outline-none"
            />
            <input
              type="number"
              min={1}
              value={r.qty}
              onChange={(e) =>
                setRows((rs) =>
                  rs.map((x) => (x.id === r.id ? { ...x, qty: Math.max(1, +e.target.value || 1) } : x)),
                )
              }
              className="w-10 rounded-md bg-paper-100 px-1.5 py-1 text-center text-xs text-ink-700 outline-none"
            />
            <div className="flex items-center text-sm font-semibold text-ink-900">
              <span className="text-ink-400">$</span>
              <input
                type="number"
                min={0}
                value={r.price}
                onChange={(e) =>
                  setRows((rs) =>
                    rs.map((x) => (x.id === r.id ? { ...x, price: Math.max(0, +e.target.value || 0) } : x)),
                  )
                }
                className="w-16 bg-transparent text-right outline-none"
              />
            </div>
            <button
              onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
              className="opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove"
            >
              <Trash2 className="h-3.5 w-3.5 text-ink-400 hover:text-rose-600" />
            </button>
          </motion.div>
        ))}
      </div>
      <button
        onClick={() => setRows((rs) => [...rs, { id: nextId++, item: "New line item", qty: 1, price: 1000 }])}
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-900"
      >
        <Plus className="h-3.5 w-3.5" /> Add line item
      </button>
      <div className="mt-2 flex items-center justify-between rounded-xl bg-ink-900 px-3 py-2.5 text-sm text-paper-50">
        <span>Total</span>
        <span className="font-semibold">{fmt(total)}</span>
      </div>
    </div>
  );
}
