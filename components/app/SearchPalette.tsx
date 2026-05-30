"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FileText, ListChecks, Search, ShieldAlert, X } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

interface Hit {
  kind: "knowledge" | "proposal" | "rfp" | "contract";
  id: string;
  title: string;
  snippet: string;
  href: string;
  updatedAt: number;
}

const ICON: Record<Hit["kind"], typeof BookOpen> = {
  knowledge: BookOpen,
  proposal: FileText,
  rfp: ListChecks,
  contract: ShieldAlert,
};

const KIND_LABEL: Record<Hit["kind"], string> = {
  knowledge: "Knowledge",
  proposal: "Proposal",
  rfp: "RFP",
  contract: "Contract",
};

export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const reqRef = useRef(0);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setHits([]);
    setActive(0);
  }, []);

  // Cmd/Ctrl+K opens it
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const my = ++reqRef.current;
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        if (my !== reqRef.current) return;
        if (res.ok) {
          const data = await res.json();
          setHits(data.hits || []);
          setActive(0);
        }
      } finally {
        if (my === reqRef.current) setLoading(false);
      }
    }, 180);
    return () => clearTimeout(id);
  }, [q]);

  function go(hit: Hit) {
    close();
    router.push(hit.href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-full border border-ink-900/[0.08] bg-paper-50/60 px-3 py-1.5 text-xs text-ink-500 transition-colors hover:bg-paper-50 md:inline-flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <kbd className="rounded border border-ink-900/[0.08] bg-paper-100 px-1 py-0.5 text-[10px] font-medium text-ink-400">⌘K</kbd>
      </button>
      <button
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-full border border-ink-900/10 text-ink-900 md:hidden"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] flex items-start justify-center bg-ink-900/30 p-4 backdrop-blur-sm sm:p-12"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ ease, duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-xl overflow-hidden p-0"
              role="dialog"
            >
              <div className="flex items-center gap-2 border-b border-ink-900/[0.06] px-4 py-3">
                <Search className="h-4 w-4 text-ink-400" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActive((a) => Math.min(hits.length - 1, a + 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActive((a) => Math.max(0, a - 1));
                    } else if (e.key === "Enter" && hits[active]) {
                      e.preventDefault();
                      go(hits[active]);
                    }
                  }}
                  placeholder="Search knowledge, proposals, RFPs, contracts…"
                  className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
                />
                <button onClick={close} className="text-ink-400 hover:text-ink-900" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {loading && <p className="px-3 py-4 text-xs text-ink-400">Searching…</p>}
                {!loading && q.trim().length < 2 && (
                  <p className="px-3 py-4 text-xs text-ink-400">Type two or more characters.</p>
                )}
                {!loading && q.trim().length >= 2 && hits.length === 0 && (
                  <p className="px-3 py-4 text-xs text-ink-400">No matches.</p>
                )}
                {hits.map((h, i) => {
                  const Icon = ICON[h.kind];
                  const isActive = i === active;
                  return (
                    <button
                      key={`${h.kind}-${h.id}`}
                      onClick={() => go(h)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        isActive ? "bg-paper-100" : "hover:bg-paper-50"
                      }`}
                    >
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-paper-50 text-ink-700">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-ink-900">{h.title}</span>
                          <span className="text-[10px] uppercase tracking-wider text-ink-400">{KIND_LABEL[h.kind]}</span>
                        </div>
                        {h.snippet && <p className="mt-0.5 truncate text-[11px] text-ink-500">{h.snippet}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
