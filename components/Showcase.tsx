"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ListChecks, ShieldAlert } from "lucide-react";
import { InteractiveProposal } from "./demos/InteractiveProposal";
import { InteractiveRfp } from "./demos/InteractiveRfp";
import { InteractiveContract } from "./demos/InteractiveContract";

const tabs = [
  { key: "proposals", label: "Proposal", icon: FileText, Demo: InteractiveProposal, caption: "Edit the line items, then generate." },
  { key: "rfp", label: "RFP", icon: ListChecks, Demo: InteractiveRfp, caption: "Edit the questions, then auto-answer." },
  { key: "contracts", label: "Contract", icon: ShieldAlert, Demo: InteractiveContract, caption: "Paste a clause, then review." },
] as const;

export function Showcase() {
  const [active, setActive] = useState(0);
  const Current = tabs[active];

  return (
    <div className="card relative overflow-hidden p-5 shadow-lift sm:p-6">
      <span className="shimmer-sweep" />
      <div className="relative">
        <div className="mb-5 flex items-center gap-2">
          {tabs.map((t, i) => {
            const isActive = i === active;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActive(i)}
                className={`relative flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive ? "text-ink-900" : "text-ink-400 hover:text-ink-700"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="showcase-pill"
                    className="absolute inset-0 rounded-full border border-ink-900/[0.08] bg-paper-100"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <Icon className="relative h-3.5 w-3.5" />
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={Current.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Current.Demo />
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-5 text-xs text-ink-500">{Current.caption} It&apos;s live — try it.</p>
      </div>
    </div>
  );
}
