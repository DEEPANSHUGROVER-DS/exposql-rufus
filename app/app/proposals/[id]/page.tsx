"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  RotateCcw,
} from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { PageHeader, Panel } from "@/components/app/ui";
import { PricingEditor } from "@/components/app/PricingEditor";
import { InlineEditTextarea } from "@/components/app/InlineEditTextarea";
import { proposalSectionCost } from "@/lib/pricing";
import type { PricingRow, ProposalRow } from "@/lib/db/schema";

const ease = [0.22, 1, 0.36, 1] as const;
const SECTION_KEYS = ["Overview", "Objectives", "Scope of work", "Deliverables", "Timeline", "Terms", "Next steps"] as const;
type SectionKey = (typeof SECTION_KEYS)[number];

export default function ProposalEditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { profile, remaining, refresh } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProposalRow | null>(null);

  const [sections, setSections] = useState<Record<SectionKey, string>>({} as Record<SectionKey, string>);
  const [rows, setRows] = useState<PricingRow[]>([]);
  const [status, setStatus] = useState<"draft" | "sent" | "won" | "lost">("draft");
  const [toast, setToast] = useState<string | null>(null);
  const [regenBusy, setRegenBusy] = useState<SectionKey | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Debounced PATCH on edits
  const patchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/proposals/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) {
          setError(data?.error || `Failed (${res.status})`);
          return;
        }
        const p: ProposalRow = data.proposal;
        setProposal(p);
        setSections(p.sections as Record<SectionKey, string>);
        setRows(p.pricing);
        setStatus(p.status as typeof status);
      } catch (e) {
        if (alive) setError(String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const scheduleSave = useCallback((patch: Record<string, unknown>) => {
    if (patchTimer.current) clearTimeout(patchTimer.current);
    patchTimer.current = setTimeout(async () => {
      try {
        await fetch(`/api/proposals/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(patch),
        });
      } catch {
        /* best-effort */
      }
    }, 700);
  }, [id]);

  function editSection(key: SectionKey, val: string) {
    const next = { ...sections, [key]: val };
    setSections(next);
    scheduleSave({ sections: next });
  }
  function editRows(updater: React.SetStateAction<PricingRow[]>) {
    setRows((prev) => {
      const next = typeof updater === "function" ? (updater as (p: PricingRow[]) => PricingRow[])(prev) : updater;
      scheduleSave({ pricing: next });
      return next;
    });
  }
  function changeStatus(s: typeof status) {
    setStatus(s);
    scheduleSave({ status: s });
    flash(`Saved as ${s}`);
  }

  async function regenSection(key: SectionKey) {
    if (!proposal) return;
    const c = proposalSectionCost(key);
    if (c > remaining) {
      flash("Not enough credits");
      return;
    }
    setRegenBusy(key);
    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          client: proposal.clientName,
          title: proposal.title,
          scope: proposal.scope,
          timeline: proposal.timeline,
          tone: proposal.tone,
          pricingRows: rows.map(({ item, qty, price }) => ({ item, qty, price })),
          regenSectionOnly: key,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        flash(`Regen failed: ${data?.error ?? res.status}`);
        return;
      }
      const fresh = data.sections?.[key];
      if (typeof fresh === "string") {
        const next = { ...sections, [key]: fresh };
        setSections(next);
        scheduleSave({ sections: next });
        flash(`Regenerated “${key}” · ${c}cr`);
        void refresh();
      }
    } finally {
      setRegenBusy(null);
    }
  }

  async function publish() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ publish: true }),
      });
      const data = await res.json();
      if (res.ok && data.proposal) {
        setProposal(data.proposal);
        setStatus(data.proposal.status);
        flash("Hosted link published");
      } else {
        flash(`Publish failed: ${data?.error ?? res.status}`);
      }
    } finally {
      setPublishing(false);
    }
  }

  function copyLink() {
    if (!proposal?.hostedSlug) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://rufus.exposql.com";
    navigator.clipboard?.writeText(`${origin}/p/${proposal.hostedSlug}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 1800);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel><p className="text-sm text-ink-500">Loading…</p></Panel>
      </div>
    );
  }
  if (error || !proposal) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/app/proposals" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Proposals
        </Link>
        <Panel className="!bg-rose-500/[0.06]">
          <p className="text-sm text-rose-700">{error ?? "Proposal not found."}</p>
        </Panel>
      </div>
    );
  }

  const hostedUrl = proposal.hostedSlug
    ? (typeof window !== "undefined" ? window.location.origin : "https://rufus.exposql.com") + `/p/${proposal.hostedSlug}`
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/proposals" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Proposals
      </Link>

      <PageHeader
        title={`${proposal.clientName} — ${proposal.title}`}
        subtitle="Edit any section, regenerate one, or publish a hosted link. Manual edits are free; edits autosave."
        action={
          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(e) => changeStatus(e.target.value as typeof status)}
              className="rounded-full border border-ink-900/10 bg-paper-50 px-3 py-2 text-xs font-semibold text-ink-700 outline-none"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
            <a
              href={`/api/proposals/${id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-soft py-2 text-[12px]"
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </a>
            <button onClick={publish} disabled={publishing} className="btn-dark py-2 text-[12px] disabled:opacity-50">
              <Link2 className="h-3.5 w-3.5" /> {publishing ? "Publishing…" : proposal.hostedSlug ? "Re-publish" : "Publish"}
            </button>
          </div>
        }
      />

      {hostedUrl && (
        <Panel className="mb-4 !bg-emerald-500/[0.06]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-800">Hosted link is live</p>
              <p className="truncate text-xs text-ink-500">{hostedUrl}</p>
              {proposal.viewedAt && (
                <p className="text-[11px] text-emerald-700">Opened {new Date(proposal.viewedAt).toLocaleString()}</p>
              )}
            </div>
            <div className="flex gap-2">
              <a href={hostedUrl} target="_blank" rel="noopener noreferrer" className="btn-soft py-2 text-[12px]">
                <ExternalLink className="h-3.5 w-3.5" /> Open
              </a>
              <button onClick={copyLink} className="btn-soft py-2 text-[12px]">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </Panel>
      )}

      <div className="space-y-4">
        {SECTION_KEYS.map((key, i) => (
          <Panel key={key} index={i} className="!p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">{key}</h3>
              <button
                onClick={() => regenSection(key)}
                disabled={regenBusy === key}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-500 hover:text-accent disabled:opacity-50"
              >
                <RotateCcw className="h-3 w-3" /> {regenBusy === key ? "Regenerating…" : `Regenerate · ${proposalSectionCost(key)}cr`}
              </button>
            </div>
            <InlineEditTextarea
              value={sections[key] ?? ""}
              onChange={(v) => editSection(key, v)}
              rows={key === "Deliverables" ? rows.length + 2 : 3}
              aiDisabled={remaining < 1}
              onEdited={() => void refresh()}
            />
          </Panel>
        ))}

        <Panel className="!p-5">
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Pricing</h3>
          <PricingEditor rows={rows} setRows={editRows} currency={profile.currency} />
        </Panel>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ ease }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-paper-50 shadow-lift"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
