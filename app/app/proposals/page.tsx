"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Trash2 } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/components/app/ui";
import { relativeTime, statusLabel, statusStyle } from "@/lib/app/format";
import type { ItemStatus } from "@/lib/app/types";

interface ProposalRow {
  id: string;
  clientName: string;
  title: string;
  status: ItemStatus;
  updatedAt: string;
  hostedSlug: string | null;
}

export default function ProposalsListPage() {
  const [items, setItems] = useState<ProposalRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ItemStatus | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/proposals", { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        if (res.ok) setItems(data.items);
        else setError(data?.error || `Failed (${res.status})`);
      } catch (e) {
        if (alive) setError(String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function deleteProposal(id: string) {
    if (!confirm("Delete this proposal? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((curr) => curr?.filter((p) => p.id !== id) ?? null);
      }
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = items
    ? items.filter((p) => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return p.clientName.toLowerCase().includes(q) || p.title.toLowerCase().includes(q);
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Proposals & SOWs"
        subtitle="Branded, sectioned proposals with pricing tables and e-sign-ready export."
        action={
          <Link href="/app/proposals/new" className="btn-dark py-2.5 text-[13px]">
            <Plus className="h-4 w-4" /> New proposal
          </Link>
        }
      />

      {error && (
        <Panel className="mb-5 !bg-rose-500/[0.06]">
          <p className="text-sm text-rose-700">{error}</p>
        </Panel>
      )}

      {items === null && !error && (
        <Panel><p className="text-sm text-ink-500">Loading…</p></Panel>
      )}

      {items && items.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by client or title…"
            className="input flex-1"
          />
          <div className="flex flex-wrap gap-1.5">
            {(["all", "draft", "sent", "won", "lost"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  statusFilter === s ? "bg-ink-900 text-paper-50" : "border border-ink-900/10 text-ink-600 hover:text-ink-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {items && items.length === 0 && (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No proposals yet"
          body="Create your first proposal — fill a short form and Rufus drafts the rest."
        />
      )}

      {filtered && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <Panel key={p.id} index={i} className="group relative !p-4 transition-shadow hover:shadow-lift">
              <Link href={`/app/proposals/${p.id}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-silk-lav/40">
                    <FileText className="h-5 w-5 text-ink-900" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {p.clientName} — {p.title}
                    </p>
                    <p className="text-[11px] text-ink-400">Updated {relativeTime(+new Date(p.updatedAt))}</p>
                  </div>
                </div>
                <span className={`chip shrink-0 text-[10px] ${statusStyle[p.status] ?? statusStyle.draft}`}>
                  {statusLabel[p.status] ?? p.status}
                </span>
              </Link>
              <button
                onClick={() => deleteProposal(p.id)}
                disabled={deletingId === p.id}
                aria-label="Delete proposal"
                className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5 text-ink-400 hover:text-rose-600" />
              </button>
            </Panel>
          ))}
        </div>
      )}

      {filtered && filtered.length === 0 && items && items.length > 0 && (
        <Panel><p className="text-sm text-ink-500">No proposals match this filter.</p></Panel>
      )}
    </div>
  );
}
