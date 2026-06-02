"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/Logo";
import { useApp } from "./AppProvider";
import { SearchPalette } from "./SearchPalette";

const nav = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Knowledge base", href: "/app/knowledge", icon: BookOpen },
  { label: "Proposals", href: "/app/proposals", icon: FileText },
  { label: "RFP autopilot", href: "/app/rfp", icon: ListChecks },
  { label: "Contract review", href: "/app/contracts", icon: ShieldAlert },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

function CreditMeter() {
  const { remaining, creditsIncluded } = useApp();
  const pct = creditsIncluded ? Math.max(2, Math.round((remaining / creditsIncluded) * 100)) : 0;
  const low = remaining <= creditsIncluded * 0.15;
  return (
    <Link href="/app/settings" className="block rounded-2xl border border-ink-900/[0.07] bg-white/70 p-3.5 transition-colors hover:border-ink-900/15">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-ink-500">AI credits</span>
        <span className={`font-semibold ${low ? "text-rose-600" : "text-ink-900"}`}>
          {remaining.toLocaleString()}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-900/10">
        <motion.div
          className={`h-full rounded-full ${low ? "bg-rose-500" : "bg-ink-900"}`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
        />
      </div>
      <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
        <Sparkles className="h-3 w-3" /> Get more credits
      </div>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, plan, remaining, status, isAdmin } = useApp();
  const [open, setOpen] = useState(false);

  const onOnboarding = pathname === "/app/onboarding";
  const displayName = profile.companyName.trim() || "Workspace";
  const avatarChar = (profile.companyName.trim() || "W").charAt(0).toUpperCase();

  useEffect(() => {
    if (status !== "ready") return;
    if (!profile.onboardingComplete && !onOnboarding) {
      router.replace("/app/onboarding");
    }
  }, [status, profile.onboardingComplete, onOnboarding, router]);

  useEffect(() => setOpen(false), [pathname]);

  // Onboarding renders full-bleed, without the shell chrome.
  if (onOnboarding) return <>{children}</>;

  const brandStyle = {
    ["--brand-primary" as string]: profile.primaryColor || "#1B1A16",
    ["--brand-accent" as string]: profile.accentColor || "#5b5bd6",
  } as React.CSSProperties;

  return (
    <div className="flex min-h-screen" style={brandStyle}>
      {/* sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-ink-900/[0.07] bg-paper-50/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="px-2 py-2">
            <Logo />
          </div>
          <nav className="mt-6 flex flex-col gap-1">
            {nav.map((n) => {
              const active = pathname === n.href || (n.href !== "/app" && pathname.startsWith(n.href));
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-ink-900 text-paper-50" : "text-ink-600 hover:bg-ink-900/[0.05] hover:text-ink-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/app/admin"
                className={`mt-3 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/[0.06] px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/[0.12] ${
                  pathname.startsWith("/app/admin") ? "bg-accent/15" : ""
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>
          <div className="mt-auto space-y-3">
            <CreditMeter />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-ink-500 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-900"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
            <Link href="/" className="block px-3 text-[11px] text-ink-400 transition-colors hover:text-ink-900">
              ← Back to rufus.exposql.com
            </Link>
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-ink-900/20 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-900/[0.06] bg-paper/70 px-5 py-3 backdrop-blur-xl">
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-ink-900/10 text-ink-900 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="hidden text-sm font-medium text-ink-500 lg:block">
            {displayName} · <span className="capitalize text-ink-400">{plan === "free" ? "Pay as you go" : `${plan} plan`}</span>
          </div>
          <div className="flex items-center gap-3">
            <SearchPalette />
            <Link href="/app/settings" className="text-xs font-semibold text-ink-500 hover:text-ink-900">
              {remaining.toLocaleString()} credits
            </Link>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-xs font-semibold text-paper-50">
              {avatarChar}
            </span>
          </div>
        </header>
        <div className="min-w-0 flex-1 px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
