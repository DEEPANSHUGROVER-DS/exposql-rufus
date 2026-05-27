"use client";

import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { EmptyState, PageHeader, Panel } from "@/components/app/ui";
import { relativeTime, statusLabel, statusStyle } from "@/lib/app/format";

export default function ProposalsListPage() {
  const { recent } = useApp();
  const proposals = recent.filter((r) => r.kind === "proposal");

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

      {proposals.length ? (
        <div className="space-y-3">
          {proposals.map((p, i) => (
            <Panel key={p.id} index={i} className="!p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-silk-lav/40">
                    <FileText className="h-5 w-5 text-ink-900" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{p.title}</p>
                    <p className="text-[11px] text-ink-400">Updated {relativeTime(p.updatedAt)}</p>
                  </div>
                </div>
                <span className={`chip shrink-0 text-[10px] ${statusStyle[p.status]}`}>{statusLabel[p.status]}</span>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No proposals yet"
          body="Create your first proposal — fill a short form and Rufus drafts the rest."
        />
      )}
    </div>
  );
}
