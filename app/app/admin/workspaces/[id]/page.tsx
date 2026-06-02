"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { PageHeader, Panel } from "@/components/app/ui";
import { relativeTime } from "@/lib/app/format";

interface WorkspaceDetail {
  workspace: {
    id: string;
    companyName: string;
    website: string;
    industry: string;
    plan: string;
    creditsIncluded: number;
    creditsBought: number;
    creditsUsed: number;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    subscriptionStatus: string | null;
    createdAt: string;
  };
  owner: { id: string; email: string; name: string | null; createdAt: string } | null;
  counts: { knowledge: number; proposals: number; rfps: number; contracts: number };
  ledger: { id: string; delta: number; reason: string; source: string; createdAt: string }[];
  purchases: { id: string; packKey: string; credits: number; amount: number; status: string; createdAt: string }[];
}

const usd = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdminWorkspacePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { isAdmin, status } = useApp();

  const [data, setData] = useState<WorkspaceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [granting, setGranting] = useState(false);
  const [credits, setCredits] = useState("100");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/workspaces/${id}`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
    else setError((await res.json().catch(() => ({}))).error || `Failed (${res.status})`);
  }, [id]);

  useEffect(() => {
    if (status !== "ready") return;
    if (!isAdmin) {
      router.replace("/app");
      return;
    }
    void load();
  }, [status, isAdmin, load, router]);

  if (status !== "ready" || !isAdmin) return null;

  async function grant() {
    if (!data?.owner?.email) return;
    setGranting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/grant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: data.owner.email, credits: Number(credits), reason }),
      });
      const out = await res.json();
      if (res.ok) {
        setMsg(`Granted ${credits} credits.`);
        setReason("");
        await load();
      } else {
        setMsg(`Error: ${out?.error ?? res.status}`);
      }
    } finally {
      setGranting(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/app/admin" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <Panel className="!bg-rose-500/[0.06]">
          <p className="text-sm text-rose-700">{error}</p>
        </Panel>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel><p className="text-sm text-ink-500">Loading…</p></Panel>
      </div>
    );
  }

  const remaining = Math.max(0, data.workspace.creditsIncluded + data.workspace.creditsBought - data.workspace.creditsUsed);
  const tiles = [
    { label: "Plan", value: data.workspace.plan, capital: true },
    { label: "Credits remaining", value: remaining.toLocaleString() },
    { label: "Credits used", value: data.workspace.creditsUsed.toLocaleString() },
    { label: "Credits bought", value: data.workspace.creditsBought.toLocaleString() },
    { label: "Knowledge", value: data.counts.knowledge },
    { label: "Proposals", value: data.counts.proposals },
    { label: "RFPs", value: data.counts.rfps },
    { label: "Contracts", value: data.counts.contracts },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/app/admin" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Admin
      </Link>

      <PageHeader
        title={data.workspace.companyName || "(no company name)"}
        subtitle={data.owner ? `${data.owner.name || data.owner.email} · created ${relativeTime(+new Date(data.workspace.createdAt))}` : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <Panel key={t.label} index={i} className="!p-5">
            <p className="text-xs font-medium text-ink-400">{t.label}</p>
            <p className={`mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink-900 ${t.capital ? "capitalize" : ""}`}>
              {t.value}
            </p>
          </Panel>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="text-sm font-semibold text-ink-900">Workspace</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row k="ID" v={data.workspace.id} />
            <Row k="Website" v={data.workspace.website || "—"} />
            <Row k="Industry" v={data.workspace.industry || "—"} />
            <Row k="Stripe customer" v={data.workspace.stripeCustomerId || "—"} />
            <Row k="Subscription" v={data.workspace.stripeSubscriptionId || "—"} />
            <Row k="Sub status" v={data.workspace.subscriptionStatus || "—"} />
          </dl>
        </Panel>

        <Panel>
          <h2 className="text-sm font-semibold text-ink-900">Grant credits</h2>
          {data.owner?.email ? (
            <>
              <p className="mt-1 text-xs text-ink-500">Granting to <strong>{data.owner.email}</strong>.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[120px_1fr_auto]">
                <input value={credits} onChange={(e) => setCredits(e.target.value)} type="number" min={1} className="input" />
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="input" />
                <button onClick={grant} disabled={granting} className="btn-dark py-2.5 text-[13px] disabled:opacity-50">
                  <Sparkles className="h-4 w-4" /> {granting ? "…" : "Grant"}
                </button>
              </div>
              {msg && <p className="mt-3 text-xs text-ink-500">{msg}</p>}
            </>
          ) : (
            <p className="mt-1 text-xs text-ink-400">Owner email missing — can't grant.</p>
          )}
        </Panel>
      </div>

      <WorkspaceItems id={id} />

      <h2 className="mt-8 text-sm font-semibold text-ink-500">Pack purchases</h2>
      <Panel className="mt-3">
        <div className="divide-y divide-ink-900/[0.06]">
          {data.purchases.length ? (
            data.purchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-700">{p.credits.toLocaleString()} credits ({p.packKey})</p>
                  <p className="text-[11px] text-ink-400">{relativeTime(+new Date(p.createdAt))} · {p.status}</p>
                </div>
                <p className="text-sm font-semibold text-ink-900">{usd(p.amount)}</p>
              </div>
            ))
          ) : (
            <p className="py-3 text-xs text-ink-400">No purchases yet.</p>
          )}
        </div>
      </Panel>

      <h2 className="mt-8 text-sm font-semibold text-ink-500">Ledger</h2>
      <Panel className="mt-3">
        <div className="divide-y divide-ink-900/[0.06]">
          {data.ledger.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink-700">{l.reason}</p>
                <p className="text-[11px] text-ink-400">{l.source} · {relativeTime(+new Date(l.createdAt))}</p>
              </div>
              <span className={`shrink-0 text-sm font-semibold ${l.delta < 0 ? "text-ink-900" : "text-emerald-600"}`}>
                {l.delta > 0 ? "+" : ""}{l.delta.toLocaleString()}
              </span>
            </div>
          ))}
          {data.ledger.length === 0 && <p className="py-3 text-xs text-ink-400">No activity.</p>}
        </div>
      </Panel>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs text-ink-400">{k}</dt>
      <dd className="truncate text-right text-sm text-ink-700">{v}</dd>
    </div>
  );
}

interface WorkspaceItemsData {
  proposals: { id: string; clientName: string; title: string; status: string; hostedSlug: string | null; viewedAt: string | null; updatedAt: string }[];
  rfps: { id: string; title: string; status: string; updatedAt: string }[];
  contracts: { id: string; title: string; fileName: string; createdAt: string }[];
}

function WorkspaceItems({ id }: { id: string }) {
  const [tab, setTab] = useState<"proposals" | "rfps" | "contracts">("proposals");
  const [data, setData] = useState<WorkspaceItemsData | null>(null);

  useEffect(() => {
    void fetch(`/api/admin/workspaces/${id}/items`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d as WorkspaceItemsData));
  }, [id]);

  const tabs = [
    { key: "proposals" as const, label: `Proposals (${data?.proposals.length ?? "—"})` },
    { key: "rfps" as const, label: `RFPs (${data?.rfps.length ?? "—"})` },
    { key: "contracts" as const, label: `Contracts (${data?.contracts.length ?? "—"})` },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-ink-500">Items</h2>
      <div className="mt-2 mb-3 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.key ? "bg-ink-900 text-paper-50" : "border border-ink-900/10 text-ink-600 hover:text-ink-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Panel>
        <div className="divide-y divide-ink-900/[0.06]">
          {!data && <p className="py-3 text-xs text-ink-400">Loading…</p>}
          {data && tab === "proposals" && (data.proposals.length === 0
            ? <p className="py-3 text-xs text-ink-400">No proposals.</p>
            : data.proposals.map((p) => (
              <Link key={p.id} href={`/app/proposals/${p.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-paper-100/40 -mx-2 px-2 rounded-lg">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-800">{p.clientName} — {p.title}</p>
                  <p className="text-[11px] text-ink-400">
                    {p.status} · updated {relativeTime(+new Date(p.updatedAt))}
                    {p.viewedAt && ` · opened ${relativeTime(+new Date(p.viewedAt))}`}
                    {p.hostedSlug && " · published"}
                  </p>
                </div>
              </Link>
            )))}
          {data && tab === "rfps" && (data.rfps.length === 0
            ? <p className="py-3 text-xs text-ink-400">No RFPs.</p>
            : data.rfps.map((r) => (
              <Link key={r.id} href={`/app/rfp/${r.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-paper-100/40 -mx-2 px-2 rounded-lg">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-800">{r.title}</p>
                  <p className="text-[11px] text-ink-400">{r.status} · {relativeTime(+new Date(r.updatedAt))}</p>
                </div>
              </Link>
            )))}
          {data && tab === "contracts" && (data.contracts.length === 0
            ? <p className="py-3 text-xs text-ink-400">No contracts.</p>
            : data.contracts.map((c) => (
              <Link key={c.id} href={`/app/contracts/${c.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-paper-100/40 -mx-2 px-2 rounded-lg">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-800">{c.title}</p>
                  <p className="text-[11px] text-ink-400">{c.fileName || "pasted text"} · {relativeTime(+new Date(c.createdAt))}</p>
                </div>
              </Link>
            )))}
        </div>
      </Panel>
    </div>
  );
}
