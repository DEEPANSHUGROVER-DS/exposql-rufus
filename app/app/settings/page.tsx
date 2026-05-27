"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { PageHeader, Panel } from "@/components/app/ui";
import { relativeTime } from "@/lib/app/format";
import { creditPacks, plans } from "@/lib/pricing";

const themes = ["Light", "Warm", "Bold"] as const;
const swatches = ["#1B1A16", "#5b5bd6", "#0f766e", "#b91c1c", "#9333ea", "#2563eb"];

export default function SettingsPage() {
  const { profile, setProfile, plan, creditsIncluded, creditsUsed, remaining, ledger, grant, reset } = useApp();
  const [tab, setTab] = useState<"brand" | "billing">("brand");
  const [justBought, setJustBought] = useState<number | null>(null);

  const currentPlan = plans.find((p) => p.key === plan);

  function buy(credits: number) {
    grant(credits, `Credit pack purchase: ${credits.toLocaleString()} credits`);
    setJustBought(credits);
    setTimeout(() => setJustBought((c) => (c === credits ? null : c)), 1800);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="Your brand kit and billing. Brand is applied to the editor, exports, and hosted links." />

      <div className="mb-6 inline-flex rounded-full border border-ink-900/[0.08] bg-paper-50/70 p-1">
        {(["brand", "billing"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
              tab === t ? "bg-ink-900 text-paper-50" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            {t === "brand" ? "Brand kit" : "Billing & credits"}
          </button>
        ))}
      </div>

      {tab === "brand" ? (
        <div className="space-y-4">
          <Panel>
            <h3 className="text-sm font-semibold text-ink-900">Logo</h3>
            <p className="mt-1 text-xs text-ink-500">Paste a logo URL (file upload connects with the backend later).</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-ink-900/10 bg-paper-100 text-xs text-ink-400">
                {profile.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.logoUrl} alt="Logo preview" className="h-full w-full object-contain" />
                ) : (
                  "Logo"
                )}
              </div>
              <input
                value={profile.logoUrl}
                onChange={(e) => setProfile({ logoUrl: e.target.value })}
                placeholder="https://…/logo.png"
                className="input flex-1"
              />
            </div>
          </Panel>

          <Panel>
            <h3 className="text-sm font-semibold text-ink-900">Colors</h3>
            <div className="mt-3 grid gap-5 sm:grid-cols-2">
              {(["primaryColor", "accentColor"] as const).map((field) => (
                <div key={field}>
                  <span className="mb-2 block text-xs font-medium text-ink-500">
                    {field === "primaryColor" ? "Primary" : "Accent"}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {swatches.map((c) => (
                      <button
                        key={c}
                        onClick={() => setProfile({ [field]: c })}
                        className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-white transition-all ${
                          profile[field] === c ? "ring-ink-900" : "ring-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Set ${field} to ${c}`}
                      />
                    ))}
                    <input
                      value={profile[field]}
                      onChange={(e) => setProfile({ [field]: e.target.value })}
                      className="input w-24 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-sm font-semibold text-ink-900">Hosted page theme</h3>
            <div className="mt-3 flex gap-2">
              {themes.map((t) => (
                <button
                  key={t}
                  onClick={() => setProfile({ theme: t })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    profile.theme === t ? "bg-ink-900 text-paper-50" : "border border-ink-900/10 text-ink-600 hover:text-ink-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      ) : (
        <div className="space-y-4">
          <Panel>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-ink-400">Current plan</p>
                <p className="mt-1 text-2xl font-semibold capitalize tracking-[-0.02em] text-ink-900">{plan}</p>
                <p className="text-xs text-ink-400">
                  ${currentPlan?.priceMonthly}/mo · {creditsIncluded.toLocaleString()} credits / cycle
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-ink-400">Remaining</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-ink-900">{remaining.toLocaleString()}</p>
                <p className="text-xs text-ink-400">{creditsUsed.toLocaleString()} used</p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-900/10">
              <div
                className="h-full rounded-full bg-ink-900"
                style={{ width: `${creditsIncluded ? Math.max(2, (remaining / creditsIncluded) * 100) : 0}%` }}
              />
            </div>
          </Panel>

          <Panel>
            <h3 className="text-sm font-semibold text-ink-900">Buy credit packs</h3>
            <p className="mt-1 text-xs text-ink-500">Credits never expire. (Checkout connects to Stripe later.)</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {creditPacks.map((p) => (
                <div key={p.credits} className="rounded-2xl border border-ink-900/[0.07] bg-paper-50/70 p-4">
                  <div className="text-lg font-semibold tracking-[-0.02em] text-ink-900">{p.credits.toLocaleString()}</div>
                  <div className="text-xs text-ink-400">${p.price}</div>
                  <button
                    onClick={() => buy(p.credits)}
                    className={`mt-3 w-full rounded-full py-2 text-[12px] font-semibold transition-colors ${
                      justBought === p.credits ? "bg-emerald-500 text-white" : "btn-soft"
                    }`}
                  >
                    {justBought === p.credits ? <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Added</span> : "Buy"}
                  </button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-sm font-semibold text-ink-900">Credit ledger</h3>
            <div className="mt-3 divide-y divide-ink-900/[0.06]">
              {ledger.slice(0, 10).map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink-700">{l.reason}</p>
                    <p className="text-[11px] text-ink-400">{relativeTime(l.at)}</p>
                  </div>
                  <span className={`shrink-0 text-sm font-semibold ${l.delta < 0 ? "text-ink-900" : "text-emerald-600"}`}>
                    {l.delta > 0 ? "+" : ""}{l.delta.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <button onClick={reset} className="text-xs font-semibold text-ink-400 hover:text-rose-600">
            Reset demo data
          </button>
        </div>
      )}
    </div>
  );
}
