"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Trash2, Upload } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { PageHeader, Panel } from "@/components/app/ui";
import { relativeTime } from "@/lib/app/format";
import { creditPacks, plans } from "@/lib/pricing";

const themes = ["Light", "Warm", "Bold"] as const;
const swatches = ["#1B1A16", "#5b5bd6", "#0f766e", "#b91c1c", "#9333ea", "#2563eb"];

function LogoPanel() {
  const { profile, setProfile, refresh } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/workspace/logo", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || data?.error || `Upload failed (${res.status})`);
        return;
      }
      // refresh workspace state so the new logoUrl reflects
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function clearLogo() {
    setBusy(true);
    setError(null);
    try {
      await fetch("/api/workspace/logo", { method: "DELETE" });
      setProfile({ logoUrl: "" });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel>
      <h3 className="text-sm font-semibold text-ink-900">Logo</h3>
      <p className="mt-1 text-xs text-ink-500">
        Upload a PNG, JPG, SVG, or WebP (max 1.5 MB). Or paste a URL if you already host it.
      </p>
      <div className="mt-3 flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-ink-900/10 bg-paper-100 text-xs text-ink-400">
          {profile.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logoUrl} alt="Logo preview" className="h-full w-full object-contain" />
          ) : (
            "Logo"
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            value={profile.logoUrl}
            onChange={(e) => setProfile({ logoUrl: e.target.value })}
            placeholder="https://…/logo.png"
            className="input"
          />
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="btn-soft py-2 text-[12px] disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" /> {busy ? "Uploading…" : "Upload file"}
            </button>
            {profile.logoUrl && (
              <button
                type="button"
                onClick={clearLogo}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/10 px-3 py-2 text-[12px] font-semibold text-ink-600 hover:text-rose-600 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      </div>
    </Panel>
  );
}

export default function SettingsPage() {
  const { profile, setProfile, plan, creditsIncluded, creditsUsed, remaining, ledger, refresh } = useApp();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"brand" | "billing">("brand");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = plans.find((p) => p.key === plan);

  // Auto-trigger checkout when arriving from /pricing with ?upgrade= or ?pack=
  // and surface a success toast when Stripe redirects back with ?checkout=success.
  useEffect(() => {
    const upgrade = searchParams.get("upgrade");
    const pack = searchParams.get("pack");
    const checkoutResult = searchParams.get("checkout");

    if (checkoutResult === "success") {
      setTab("billing");
      // Webhook may take a beat — refresh state after a short delay
      const t = setTimeout(() => void refresh(), 1500);
      return () => clearTimeout(t);
    }
    if (upgrade && (upgrade === "starter" || upgrade === "growth" || upgrade === "scale")) {
      setTab("billing");
      void autoCheckout("subscription", upgrade);
    } else if (pack && (pack === "pack100" || pack === "pack300" || pack === "pack750" || pack === "pack2000")) {
      setTab("billing");
      void autoCheckout("pack", pack);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function autoCheckout(kind: "subscription" | "pack", key: string) {
    await checkout(kind, key);
  }

  async function checkout(kind: "subscription" | "pack", key: string) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, key }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.error || "Could not start checkout.");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(null);
    }
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
          <LogoPanel />


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
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Manage subscription</h3>
                <p className="mt-1 text-xs text-ink-500">Cancel, change card, download invoices — handled by Stripe&apos;s billing portal.</p>
              </div>
              <button
                onClick={async () => {
                  setBusy("portal");
                  setError(null);
                  try {
                    const res = await fetch("/api/stripe/portal", { method: "POST" });
                    const data = await res.json();
                    if (res.ok && data.url) {
                      window.location.href = data.url;
                      return;
                    }
                    setError(data?.message || data?.error || "Could not open the portal.");
                  } catch (e) {
                    setError(String(e));
                  } finally {
                    setBusy(null);
                  }
                }}
                disabled={busy === "portal"}
                className="btn-soft py-2 text-[12px] disabled:opacity-50"
              >
                {busy === "portal" ? "Opening…" : "Open billing portal"}
              </button>
            </div>
          </Panel>

          <Panel>
            <h3 className="text-sm font-semibold text-ink-900">Upgrade your plan</h3>
            <p className="mt-1 text-xs text-ink-500">Switches you to Stripe checkout. New allowance lands as soon as payment clears.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {plans
                .filter((p) => p.stripePriceKey)
                .map((p) => {
                  const isCurrent = plan === p.key;
                  return (
                    <div
                      key={p.key}
                      className={`rounded-2xl border bg-paper-50/70 p-4 ${
                        isCurrent ? "border-accent/30 ring-1 ring-accent/20" : "border-ink-900/[0.07]"
                      }`}
                    >
                      <div className="text-sm font-semibold text-ink-900">{p.name}</div>
                      <div className="text-xs text-ink-400">${p.priceMonthly}/mo · {p.includedCredits.toLocaleString()} credits</div>
                      <button
                        onClick={() => checkout("subscription", p.stripePriceKey!)}
                        disabled={isCurrent || busy === p.stripePriceKey}
                        className="btn-soft mt-3 w-full py-2 text-[12px] disabled:opacity-50"
                      >
                        {isCurrent ? "Current plan" : busy === p.stripePriceKey ? "Opening…" : `Switch to ${p.name}`}
                      </button>
                    </div>
                  );
                })}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-sm font-semibold text-ink-900">Buy credit packs</h3>
            <p className="mt-1 text-xs text-ink-500">Credits never expire. Checkout opens in Stripe.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {creditPacks.map((p) => (
                <div key={p.key} className="rounded-2xl border border-ink-900/[0.07] bg-paper-50/70 p-4">
                  <div className="text-lg font-semibold tracking-[-0.02em] text-ink-900">{p.credits.toLocaleString()}</div>
                  <div className="text-xs text-ink-400">${p.price}</div>
                  <button
                    onClick={() => checkout("pack", p.key)}
                    disabled={busy === p.key}
                    className="btn-soft mt-3 w-full py-2 text-[12px] disabled:opacity-50"
                  >
                    {busy === p.key ? "Opening…" : "Buy"}
                  </button>
                </div>
              ))}
            </div>
          </Panel>

          {error && (
            <Panel className="!bg-rose-500/[0.06]">
              <p className="text-sm text-rose-700">{error}</p>
            </Panel>
          )}

          <Panel>
            <h3 className="text-sm font-semibold text-ink-900">Credit ledger</h3>
            <div className="mt-3 divide-y divide-ink-900/[0.06]">
              {ledger.length ? (
                ledger.slice(0, 10).map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink-700">{l.reason}</p>
                      <p className="text-[11px] text-ink-400">{relativeTime(l.at)}</p>
                    </div>
                    <span className={`shrink-0 text-sm font-semibold ${l.delta < 0 ? "text-ink-900" : "text-emerald-600"}`}>
                      {l.delta > 0 ? "+" : ""}{l.delta.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-3 text-xs text-ink-400">No activity yet.</p>
              )}
            </div>
          </Panel>

          <DataAndAccountPanel />
        </div>
      )}
    </div>
  );
}

function DataAndAccountPanel() {
  const { profile } = useApp();
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function destroy() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmEmail: confirm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data?.error === "confirmation_mismatch"
            ? "The email you typed doesn't match your account."
            : data?.error || `Failed (${res.status})`,
        );
        setDeleting(false);
        return;
      }
      // Sign out and redirect home
      window.location.href = "/";
    } catch (e) {
      setError(String(e));
      setDeleting(false);
    }
  }

  return (
    <Panel>
      <h3 className="text-sm font-semibold text-ink-900">Your data</h3>
      <p className="mt-1 text-xs text-ink-500">
        Download everything Rufus stores about your workspace, or delete the account permanently.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href="/api/account/export" className="btn-soft py-2 text-[12px]">
          Download my data
        </a>
        <button onClick={() => setShowConfirm((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 px-3 py-2 text-[12px] font-semibold text-rose-700 hover:bg-rose-500/[0.06]">
          Delete account
        </button>
      </div>

      {showConfirm && (
        <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-4">
          <p className="text-sm font-medium text-rose-700">This permanently deletes your account.</p>
          <p className="mt-1 text-xs text-ink-600">
            Your workspace, knowledge base, proposals, RFP responses, and contract reviews will be wiped from
            our active systems. Billing records may be retained as required by tax law. Type{" "}
            <strong>{profile.companyName ? "" : ""}your email below</strong> to confirm.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type your sign-in email to confirm"
              className="input flex-1 text-sm"
            />
            <button
              onClick={destroy}
              disabled={!confirm.trim() || deleting}
              className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2.5 text-[12px] font-semibold text-white shadow-pill transition-colors hover:bg-rose-700 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete forever"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
        </div>
      )}
    </Panel>
  );
}
