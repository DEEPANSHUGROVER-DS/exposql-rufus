"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, FileText, ListChecks, ShieldAlert, Sparkles } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { PageHeader, Panel } from "@/components/app/ui";
import { kindLabel, relativeTime, statusLabel, statusStyle } from "@/lib/app/format";

const quickActions = [
  { label: "New proposal", href: "/app/proposals/new", icon: FileText, accent: "bg-silk-lav/40" },
  { label: "Answer an RFP", href: "/app/rfp", icon: ListChecks, accent: "bg-silk-sky/40" },
  { label: "Review a contract", href: "/app/contracts", icon: ShieldAlert, accent: "bg-silk-peach/40" },
  { label: "Add knowledge", href: "/app/knowledge", icon: BookOpen, accent: "bg-silk-mint/40" },
];

export default function DashboardPage() {
  const { profile, plan, remaining, creditsIncluded, recent, knowledge } = useApp();

  const counts = {
    proposal: recent.filter((r) => r.kind === "proposal").length,
    rfp: recent.filter((r) => r.kind === "rfp").length,
    contract: recent.filter((r) => r.kind === "contract").length,
  };

  const tiles = [
    { label: "Plan", value: plan, sub: `${creditsIncluded.toLocaleString()} credits / mo`, capital: true },
    { label: "Credits remaining", value: remaining.toLocaleString(), sub: "this cycle" },
    { label: "Proposals", value: counts.proposal, sub: "this month" },
    { label: "RFPs · Contracts", value: `${counts.rfp} · ${counts.contract}`, sub: "this month" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={`Welcome back, ${profile.companyName.split(" ")[0]}`}
        subtitle="Your document workspace at a glance. Pick up where you left off, or start something new."
      />

      {/* stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <Panel key={t.label} index={i} className="!p-5">
            <p className="text-xs font-medium text-ink-400">{t.label}</p>
            <p className={`mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink-900 ${t.capital ? "capitalize" : ""}`}>
              {t.value}
            </p>
            <p className="mt-1 text-[11px] text-ink-400">{t.sub}</p>
          </Panel>
        ))}
      </div>

      {/* quick actions */}
      <h2 className="mb-3 mt-10 text-sm font-semibold text-ink-500">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((a, i) => {
          const Icon = a.icon;
          return (
            <Panel key={a.label} index={i} className="group !p-0">
              <Link href={a.href} className="flex items-center gap-3 p-5">
                <span className={`grid h-10 w-10 place-items-center rounded-2xl ${a.accent}`}>
                  <Icon className="h-5 w-5 text-ink-900" />
                </span>
                <span className="flex-1 text-sm font-semibold text-ink-900">{a.label}</span>
                <ArrowRight className="h-4 w-4 text-ink-400 transition-transform group-hover:translate-x-1" />
              </Link>
            </Panel>
          );
        })}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {/* recent items */}
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">Recent items</h2>
            <span className="text-xs text-ink-400">{recent.length} total</span>
          </div>
          <div className="divide-y divide-ink-900/[0.06]">
            {recent.slice(0, 6).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">{r.title}</p>
                  <p className="text-[11px] text-ink-400">
                    {kindLabel[r.kind]} · {relativeTime(r.updatedAt)}
                  </p>
                </div>
                <span className={`chip shrink-0 text-[10px] ${statusStyle[r.status]}`}>{statusLabel[r.status]}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* knowledge nudge */}
        <Panel index={1}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-ink-900">Knowledge base</h2>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink-900">{knowledge.length}</p>
          <p className="text-[11px] text-ink-400">entries powering your RFP answers</p>
          <Link href="/app/knowledge" className="btn-soft mt-5 w-full py-2.5 text-[13px]">
            Manage knowledge
          </Link>
        </Panel>
      </div>
    </div>
  );
}
