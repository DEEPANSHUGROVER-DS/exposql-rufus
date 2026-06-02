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

  const planLabel = plan === "free" ? "Pay as you go" : plan;
  const planSub =
    plan === "free" ? "Buy credit packs as needed" : `${creditsIncluded.toLocaleString()} credits / mo`;

  const tiles = [
    { label: "Plan", value: planLabel, sub: planSub, capital: plan !== "free" },
    { label: "Credits remaining", value: remaining.toLocaleString(), sub: plan === "free" ? "ever" : "this cycle" },
    { label: "Proposals", value: counts.proposal, sub: "this month" },
    { label: "RFPs · Contracts", value: `${counts.rfp} · ${counts.contract}`, sub: "this month" },
  ];

  const firstName = profile.companyName.trim().split(" ")[0] || "there";

  // Show the getting-started checklist on a brand-new workspace: no recent
  // items in any tool, no spent credits, no purchased credits, no ledger
  // activity at all. Once the user takes any action it disappears.
  const isFreshWorkspace = recent.length === 0 && remaining === 0 && knowledge.length < 2;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={`Welcome${isFreshWorkspace ? "" : " back"}, ${firstName}`}
        subtitle={isFreshWorkspace
          ? "Three quick steps and you're generating. Manual editing is always free."
          : "Your document workspace at a glance. Pick up where you left off, or start something new."}
      />

      {isFreshWorkspace && <GettingStarted hasKnowledge={knowledge.length > 0} />}

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
            {recent.slice(0, 6).map((r) => {
              const href = `/app/${r.kind === "rfp" ? "rfp" : r.kind === "contract" ? "contracts" : "proposals"}/${r.id}`;
              return (
                <Link key={r.id} href={href} className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-paper-100/40 -mx-2 px-2 rounded-lg">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">{r.title}</p>
                    <p className="text-[11px] text-ink-400">
                      {kindLabel[r.kind]} · {relativeTime(r.updatedAt)}
                    </p>
                  </div>
                  <span className={`chip shrink-0 text-[10px] ${statusStyle[r.status] ?? statusStyle.draft}`}>{statusLabel[r.status] ?? r.status}</span>
                </Link>
              );
            })}
            {recent.length === 0 && (
              <p className="py-4 text-sm text-ink-400">Nothing here yet — start a proposal or paste an RFP.</p>
            )}
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

function GettingStarted({ hasKnowledge }: { hasKnowledge: boolean }) {
  const steps = [
    {
      done: hasKnowledge,
      title: "Add a few knowledge entries",
      body: "Security overview, pricing approach, company background — anything Rufus should answer from.",
      href: "/app/knowledge",
      cta: "Add knowledge",
      icon: BookOpen,
      accent: "bg-silk-mint/40",
    },
    {
      done: false,
      title: "Buy your first credit pack",
      body: "Pay-as-you-go starts at $15 for 100 credits — enough for ~5 proposals or one big contract review. Credits never expire.",
      href: "/app/settings?tab=billing",
      cta: "Buy credits",
      icon: Sparkles,
      accent: "bg-silk-peach/40",
    },
    {
      done: false,
      title: "Generate your first document",
      body: "Pick a tool and Rufus drafts in seconds. Manual editing afterwards is always free.",
      href: "/app/proposals/new",
      cta: "Start a proposal",
      icon: FileText,
      accent: "bg-silk-lav/40",
    },
  ];

  return (
    <div className="mb-10 rounded-[26px] border border-accent/20 bg-accent/[0.04] p-5 shadow-soft sm:p-7">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">Getting started</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              href={s.href}
              className="group flex h-full flex-col rounded-2xl border border-ink-900/[0.06] bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-center gap-2">
                <span className={`grid h-8 w-8 place-items-center rounded-xl ${s.accent}`}>
                  <Icon className="h-4 w-4 text-ink-900" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                  Step {i + 1}{s.done ? " · done" : ""}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink-900">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{s.body}</p>
              <span className="mt-auto pt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                {s.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
