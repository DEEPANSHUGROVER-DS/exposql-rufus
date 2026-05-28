"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Sparkles } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { PageHeader, Panel } from "@/components/app/ui";
import { relativeTime } from "@/lib/app/format";

interface Stats {
  counts: {
    users: number;
    workspaces: number;
    knowledge: number;
    proposals: number;
    rfps: number;
    contracts: number;
    purchasesCompleted: number;
  };
  plans: { plan: string; c: number }[];
  credits: { used: number; bought: number; included: number };
  revenueCents: number;
  recentPurchases: Array<{
    id: string;
    workspaceId: string;
    packKey: string;
    credits: number;
    amount: number;
    createdAt: string;
  }>;
  recentUsers: Array<{ id: string; email: string; name: string | null; plan: string | null; createdAt: string }>;
  recentLedger: Array<{ id: string; workspaceId: string; delta: number; reason: string; source: string; createdAt: string }>;
}

const usd = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdminPage() {
  const { isAdmin, status } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Grant form
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState("100");
  const [reason, setReason] = useState("");
  const [granting, setGranting] = useState(false);
  const [grantMsg, setGrantMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/admin/stats", { cache: "no-store" });
    if (res.ok) setStats(await res.json());
    else setError((await res.json().catch(() => ({}))).error || `Failed (${res.status})`);
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    if (!isAdmin) {
      router.replace("/app");
      return;
    }
    void refresh();
  }, [status, isAdmin, refresh, router]);

  if (status !== "ready") return null;
  if (!isAdmin) return null;

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    setGranting(true);
    setGrantMsg(null);
    try {
      const res = await fetch("/api/admin/grant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, credits: Number(credits), reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setGrantMsg(`Granted ${credits} credits to ${email}.`);
        setEmail("");
        setReason("");
        await refresh();
      } else {
        setGrantMsg(`Error: ${data?.error ?? res.status}`);
      }
    } catch (err) {
      setGrantMsg(`Error: ${String(err)}`);
    } finally {
      setGranting(false);
    }
  }

  const planByKey: Record<string, number> = Object.fromEntries((stats?.plans ?? []).map((p) => [p.plan, p.c]));
  const totalCreditsGranted = (stats?.credits.included ?? 0) + (stats?.credits.bought ?? 0);

  const tiles = [
    { label: "Users", value: stats?.counts.users ?? "—" },
    { label: "Workspaces", value: stats?.counts.workspaces ?? "—" },
    { label: "Paid subscribers", value: (planByKey.starter ?? 0) + (planByKey.growth ?? 0) + (planByKey.scale ?? 0) },
    { label: "Revenue (lifetime)", value: stats ? usd(stats.revenueCents) : "—" },
    { label: "Credits granted (total)", value: stats ? totalCreditsGranted.toLocaleString() : "—" },
    { label: "Credits used (total)", value: stats ? stats.credits.used.toLocaleString() : "—" },
    { label: "Pack purchases", value: stats?.counts.purchasesCompleted ?? "—" },
    { label: "Knowledge entries", value: stats?.counts.knowledge ?? "—" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" /> Admin
          </span>
        }
        subtitle="Workspace, credit, and revenue overview. Visible only to emails listed in ADMIN_EMAILS."
      />

      {error && (
        <Panel className="mb-6 !bg-rose-500/[0.06]">
          <p className="text-sm text-rose-700">{error}</p>
        </Panel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <Panel key={t.label} index={i} className="!p-5">
            <p className="text-xs font-medium text-ink-400">{t.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink-900">{t.value}</p>
          </Panel>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold text-ink-500">Plan breakdown</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(["free", "starter", "growth", "scale"] as const).map((p) => (
          <Panel key={p} className="!p-4">
            <p className="text-xs font-medium capitalize text-ink-400">{p}</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-ink-900">{planByKey[p] ?? 0}</p>
          </Panel>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold text-ink-500">Grant credits to a workspace</h2>
      <Panel className="mt-3">
        <form onSubmit={grant} className="grid gap-3 sm:grid-cols-[1fr_140px_140px_auto]">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@email.com"
            className="input"
            type="email"
            required
          />
          <input
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder="100"
            className="input"
            type="number"
            min={1}
            required
          />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (e.g. support refund)"
            className="input"
          />
          <button type="submit" disabled={granting} className="btn-dark py-2.5 text-[13px] disabled:opacity-50">
            <Sparkles className="h-4 w-4" /> {granting ? "Granting…" : "Grant"}
          </button>
        </form>
        {grantMsg && <p className="mt-3 text-xs text-ink-500">{grantMsg}</p>}
      </Panel>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="text-sm font-semibold text-ink-900">Recent users</h2>
          <div className="mt-3 divide-y divide-ink-900/[0.06]">
            {stats?.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-700">{u.name || u.email}</p>
                  <p className="truncate text-[11px] text-ink-400">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="chip text-[10px] capitalize">{u.plan ?? "—"}</span>
                  <p className="mt-1 text-[10px] text-ink-400">{relativeTime(+new Date(u.createdAt))}</p>
                </div>
              </div>
            )) ?? <p className="py-3 text-xs text-ink-400">Loading…</p>}
            {stats?.recentUsers.length === 0 && <p className="py-3 text-xs text-ink-400">No users yet.</p>}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-sm font-semibold text-ink-900">Recent pack purchases</h2>
          <div className="mt-3 divide-y divide-ink-900/[0.06]">
            {stats?.recentPurchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-700">
                    {p.credits.toLocaleString()} credits ({p.packKey})
                  </p>
                  <p className="truncate text-[11px] text-ink-400">{p.workspaceId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink-900">{usd(p.amount)}</p>
                  <p className="text-[10px] text-ink-400">{relativeTime(+new Date(p.createdAt))}</p>
                </div>
              </div>
            )) ?? <p className="py-3 text-xs text-ink-400">Loading…</p>}
            {stats?.recentPurchases.length === 0 && <p className="py-3 text-xs text-ink-400">No purchases yet.</p>}
          </div>
        </Panel>
      </div>

      <h2 className="mt-10 text-sm font-semibold text-ink-500">Recent ledger activity</h2>
      <Panel className="mt-3">
        <div className="divide-y divide-ink-900/[0.06]">
          {stats?.recentLedger.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink-700">{l.reason}</p>
                <p className="truncate text-[11px] text-ink-400">{l.workspaceId} · {l.source}</p>
              </div>
              <div className="text-right">
                <span className={`shrink-0 text-sm font-semibold ${l.delta < 0 ? "text-ink-900" : "text-emerald-600"}`}>
                  {l.delta > 0 ? "+" : ""}{l.delta.toLocaleString()}
                </span>
                <p className="text-[10px] text-ink-400">{relativeTime(+new Date(l.createdAt))}</p>
              </div>
            </div>
          )) ?? <p className="py-3 text-xs text-ink-400">Loading…</p>}
          {stats?.recentLedger.length === 0 && <p className="py-3 text-xs text-ink-400">No activity yet.</p>}
        </div>
      </Panel>
    </div>
  );
}
