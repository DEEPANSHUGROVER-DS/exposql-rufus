"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
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

      {items && items.length === 0 && (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No proposals yet"
          body="Create your first proposal — fill a short form and Rufus drafts the rest."
        />
      )}

      {items && items.length > 0 && (
        <div className="space-y-3">
          {items.map((p, i) => (
            <Link key={p.id} href={`/app/proposals/${p.id}`}>
              <Panel index={i} className="group !p-4 transition-shadow hover:shadow-lift">
                <div className="flex items-center justify-between gap-3">
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
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
