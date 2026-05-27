"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ListChecks, ShieldAlert } from "lucide-react";
import { ProposalMock, RfpMock, ContractMock } from "./mocks";

const tabs = [
  { key: "proposals", label: "Proposal", icon: FileText, Mock: ProposalMock, caption: "Branded proposal, drafted from a short form." },
  { key: "rfp", label: "RFP", icon: ListChecks, Mock: RfpMock, caption: "Questions answered from your knowledge base." },
  { key: "contracts", label: "Contract", icon: ShieldAlert, Mock: ContractMock, caption: "Red flags surfaced in plain English." },
] as const;

const DURATION = 4200;

export function Showcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setActive((a) => (a + 1) % tabs.length), DURATION);
    return () => clearTimeout(id);
  }, [active]);

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

        <div className="min-h-[230px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={Current.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Current.Mock />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs text-ink-500">{Current.caption}</p>
          <div className="flex gap-1.5">
            {tabs.map((t, i) => (
              <span key={t.key} className="h-1 w-8 overflow-hidden rounded-full bg-ink-900/10">
                {i === active && (
                  <motion.span
                    className="block h-full rounded-full bg-ink-900/60"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: DURATION / 1000, ease: "linear" }}
                  />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
