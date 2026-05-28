"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Copy, Download, Link2, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { CostBadge, PageHeader, Panel } from "@/components/app/ui";
import { proposalSectionCost } from "@/lib/pricing";
import type { Tone } from "@/lib/app/types";

const ease = [0.22, 1, 0.36, 1] as const;
const tones: Tone[] = ["Formal", "Friendly", "Concise"];

interface Row { id: number; item: string; qty: number; price: number; }
let nextId = 100;

const SECTION_KEYS = ["Overview", "Objectives", "Scope of work", "Deliverables", "Timeline", "Terms", "Next steps"] as const;
type SectionKey = (typeof SECTION_KEYS)[number];

export default function NewProposalPage() {
  const { profile, remaining, addRecent, refresh } = useApp();
  const [phase, setPhase] = useState<"form" | "drafting" | "editor">("form");

  const [client, setClient] = useState("");
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [timeline, setTimeline] = useState("6 weeks across discovery, design, and build");
  const [tone, setTone] = useState<Tone>(profile.defaultTone);
  const [rows, setRows] = useState<Row[]>([
    { id: 1, item: "Discovery & strategy", qty: 1, price: 4000 },
    { id: 2, item: "Design", qty: 1, price: 6500 },
    { id: 3, item: "Build & launch", qty: 1, price: 12000 },
  ]);
  const [sections, setSections] = useState<Record<SectionKey, string>>({} as Record<SectionKey, string>);
  const [status, setStatus] = useState<"draft" | "sent" | "won" | "lost">("draft");
  const [slug, setSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);

  const total = useMemo(() => rows.reduce((s, r) => s + r.qty * r.price, 0), [rows]);
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: profile.currency || "USD", maximumFractionDigits: 0 });

  const cost = Math.min(20, Math.max(12, 12 + Math.floor(scope.length / 200)));
  const blocked = cost > remaining;
  const canGenerate = client.trim() && title.trim() && !blocked;

  const formPayload = () => ({
    client,
    title,
    scope,
    timeline,
    tone,
    pricingRows: rows.map((r) => ({ item: r.item, qty: r.qty, price: r.price })),
  });

  async function generate() {
    if (!canGenerate) return;
    setPhase("drafting");
    setError(null);
    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formPayload()),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(serverError(data, res.status));
        setPhase("form");
        return;
      }
      setSections(data.sections);
      setProposalId(data.id ?? null);
      setPhase("editor");
      addRecent({ kind: "proposal", title: `${client} — ${title}`, status: "draft" });
      void refresh();
    } catch (e) {
      setError(String(e));
      setPhase("form");
    }
  }

  async function regenSection(key: SectionKey) {
    const c = proposalSectionCost(key);
    if (c > remaining) {
      flash("Not enough credits");
      return;
    }
    setError(null);
    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...formPayload(), regenSectionOnly: key }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(serverError(data, res.status));
        return;
      }
      setSections((s) => ({ ...s, [key]: data.sections[key] ?? s[key] }));
      flash(`Regenerated “${key}” · ${c}cr`);
      void refresh();
    } catch (e) {
      setError(String(e));
    }
  }

  function publish() {
    const s = `${client}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    setSlug(s || "proposal");
    setStatus("sent");
    flash("Hosted link published");
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2000);
  }

  // Silence the unused-warning for proposalId until we wire the PATCH route.
  void proposalId;

  function copyLink() {
    navigator.clipboard?.writeText(`https://rufus.exposql.com/p/${slug}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/proposals" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Proposals
      </Link>

      {error && (
        <Panel className="mb-5 !bg-rose-500/[0.06]">
          <p className="text-sm text-rose-700">{error}</p>
        </Panel>
      )}

      {phase === "form" && (
        <>
          <PageHeader title="New proposal" subtitle="Fill the essentials — Rufus drafts the full sectioned proposal." />
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

            {/* tone */}
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

            <PricingEditor rows={rows} setRows={setRows} total={total} fmt={fmt} />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-ink-400">
                <CostBadge label={`${cost} credits`} />
                <span>By scope length</span>
              </div>
              <button onClick={generate} disabled={!canGenerate} className="btn-dark py-2.5 text-[13px] disabled:opacity-50">
                <Sparkles className="h-4 w-4" /> {blocked ? "Not enough credits" : "Generate proposal"}
              </button>
            </div>
          </Panel>
        </>
      )}

      {phase === "drafting" && (
        <Panel>
          <div className="flex items-center gap-3 text-sm text-ink-500">
            <span className="flex h-4 items-center gap-[3px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="w-[3px] rounded-full bg-gradient-to-b from-silk-peri to-silk-blush animate-eq" style={{ height: "100%", animationDelay: `${i * 0.1}s` }} />
              ))}
            </span>
            Drafting your proposal in a {tone.toLowerCase()} tone…
          </div>
        </Panel>
      )}

      {phase === "editor" && (
        <>
          <PageHeader
            title={`${client} — ${title}`}
            subtitle="Edit any section, regenerate one, or publish a hosted link. Manual edits are free."
            action={
              <div className="flex flex-wrap gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="rounded-full border border-ink-900/10 bg-paper-50 px-3 py-2 text-xs font-semibold text-ink-700 outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
                <button onClick={() => flash("Exported (mock)")} className="btn-soft py-2 text-[12px]"><Download className="h-3.5 w-3.5" /> PDF</button>
                <button onClick={() => flash("Exported (mock)")} className="btn-soft py-2 text-[12px]"><Download className="h-3.5 w-3.5" /> DOCX</button>
                <button onClick={publish} className="btn-dark py-2 text-[12px]"><Link2 className="h-3.5 w-3.5" /> Publish</button>
              </div>
            }
          />

          {slug && (
            <Panel className="mb-4 !bg-emerald-500/[0.06]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink-800">Hosted link is live</p>
                  <p className="text-xs text-ink-500">rufus.exposql.com/p/{slug} · tracks when {client} opens it</p>
                </div>
                <button onClick={copyLink} className="btn-soft py-2 text-[12px]">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </Panel>
          )}

          <div className="space-y-4">
            {SECTION_KEYS.map((key, i) => (
              <Panel key={key} index={i} className="!p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink-900">{key}</h3>
                  <button onClick={() => regenSection(key)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-500 hover:text-accent">
                    <RotateCcw className="h-3 w-3" /> Regenerate · {proposalSectionCost(key)}cr
                  </button>
                </div>
                <textarea
                  value={sections[key] ?? ""}
                  onChange={(e) => setSections((s) => ({ ...s, [key]: e.target.value }))}
                  rows={key === "Deliverables" ? rows.length + 1 : 3}
                  className="input resize-none text-sm leading-relaxed"
                />
              </Panel>
            ))}

            {/* pricing section */}
            <Panel className="!p-5">
              <h3 className="mb-3 text-sm font-semibold text-ink-900">Pricing</h3>
              <PricingEditor rows={rows} setRows={setRows} total={total} fmt={fmt} />
            </Panel>
          </div>
        </>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-paper-50 shadow-lift"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
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

function PricingEditor({
  rows,
  setRows,
  total,
  fmt,
}: {
  rows: Row[];
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  total: number;
  fmt: (n: number) => string;
}) {
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
              type="number" min={1} value={r.qty}
              onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, qty: Math.max(1, +e.target.value || 1) } : x)))}
              className="w-10 rounded-md bg-paper-100 px-1.5 py-1 text-center text-xs text-ink-700 outline-none"
            />
            <div className="flex items-center text-sm font-semibold text-ink-900">
              <span className="text-ink-400">$</span>
              <input
                type="number" min={0} value={r.price}
                onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, price: Math.max(0, +e.target.value || 0) } : x)))}
                className="w-16 bg-transparent text-right outline-none"
              />
            </div>
            <button onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} className="opacity-0 transition-opacity group-hover:opacity-100" aria-label="Remove">
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
