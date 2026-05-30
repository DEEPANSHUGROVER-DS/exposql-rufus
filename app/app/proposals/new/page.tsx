"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { CostBadge, PageHeader, Panel } from "@/components/app/ui";
import { OutOfCreditsBanner } from "@/components/app/OutOfCreditsBanner";
import { PricingEditor } from "@/components/app/PricingEditor";
import type { Tone } from "@/lib/app/types";
import type { PricingRow } from "@/lib/db/schema";

const tones: Tone[] = ["Formal", "Friendly", "Concise"];

export default function NewProposalPage() {
  const router = useRouter();
  const { profile, remaining, addRecent, refresh } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [client, setClient] = useState("");
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [timeline, setTimeline] = useState("6 weeks across discovery, design, and build");
  const [tone, setTone] = useState<Tone>(profile.defaultTone);
  const [rows, setRows] = useState<PricingRow[]>([
    { id: 1, item: "Discovery & strategy", qty: 1, price: 4000 },
    { id: 2, item: "Design", qty: 1, price: 6500 },
    { id: 3, item: "Build & launch", qty: 1, price: 12000 },
  ]);

  const cost = Math.min(20, Math.max(12, 12 + Math.floor(scope.length / 200)));
  const blocked = cost > remaining;
  const canGenerate = client.trim() && title.trim() && !blocked && !busy;

  async function generate() {
    if (!canGenerate) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          client,
          title,
          scope,
          timeline,
          tone,
          pricingRows: rows.map(({ item, qty, price }) => ({ item, qty, price })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(serverError(data, res.status));
        setBusy(false);
        return;
      }
      addRecent({ kind: "proposal", title: `${client} — ${title}`, status: "draft" });
      void refresh();
      router.push(`/app/proposals/${data.id}`);
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/proposals" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Proposals
      </Link>

      <PageHeader title="New proposal" subtitle="Fill the essentials — Rufus drafts the full sectioned proposal." />

      <OutOfCreditsBanner />

      {error && (
        <Panel className="mb-5 !bg-rose-500/[0.06]">
          <p className="text-sm text-rose-700">{error}</p>
        </Panel>
      )}

      <Panel className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-500">Client name</span>
            <input value={client} onChange={(e) => setClient(e.target.value)} className="input" placeholder="Acme Corp" autoFocus />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-500">Project title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Website redesign" />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-500">Scope & deliverables</span>
          <textarea value={scope} onChange={(e) => setScope(e.target.value)} rows={4} className="input resize-none" placeholder="Bullet points or a short paragraph…" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-500">Timeline (optional)</span>
          <input value={timeline} onChange={(e) => setTimeline(e.target.value)} className="input" />
        </label>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-ink-500">Tone</span>
          <div className="flex gap-2">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  tone === t ? "bg-ink-900 text-paper-50" : "border border-ink-900/10 text-ink-600 hover:text-ink-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <PricingEditor rows={rows} setRows={setRows} currency={profile.currency} />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <CostBadge label={`${cost} credits`} />
            <span>By scope length</span>
          </div>
          <button onClick={generate} disabled={!canGenerate} className="btn-dark py-2.5 text-[13px] disabled:opacity-50">
            <Sparkles className="h-4 w-4" /> {busy ? "Drafting…" : blocked ? "Not enough credits" : "Generate proposal"}
          </button>
        </div>
      </Panel>
    </div>
  );
}

function serverError(data: { error?: string; detail?: string }, status: number): string {
  switch (data?.error) {
    case "ai_not_configured":
      return "AI isn't configured yet — set ANTHROPIC_API_KEY on Vercel to enable generation.";
    case "insufficient_credits":
      return "Not enough credits. Top up in Settings.";
    case "client_and_title_required":
      return "Add a client name and project title before generating.";
    case "ai_failed":
      return `AI call failed: ${data.detail ?? "unknown"}`;
    default:
      return `Request failed (${status}). ${data?.error ?? ""}`.trim();
  }
}
