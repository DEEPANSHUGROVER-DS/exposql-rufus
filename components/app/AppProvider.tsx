"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type {
  AppState,
  KnowledgeEntry,
  LedgerEntry,
  RecentItem,
  WorkspaceProfile,
  Plan,
} from "@/lib/app/types";

const emptyProfile: WorkspaceProfile = {
  companyName: "",
  website: "",
  industry: "",
  services: [],
  currency: "USD",
  defaultTone: "Friendly",
  clientType: "",
  onboardingComplete: false,
  primaryColor: "#1B1A16",
  accentColor: "#5b5bd6",
  theme: "Warm",
  logoUrl: "",
};

const emptyState: AppState = {
  profile: emptyProfile,
  plan: "free",
  creditsIncluded: 20,
  creditsUsed: 0,
  knowledge: [],
  recent: [],
  ledger: [],
};

interface AppContextValue extends AppState {
  remaining: number;
  status: "loading" | "ready" | "error" | "unauthenticated";
  errorMessage: string | null;
  isAdmin: boolean;
  /** Synchronous, optimistic. Returns false if balance is too low. The network
   * call happens in the background and rolls back the optimistic update on
   * failure. */
  spend: (amount: number, reason: string) => boolean;
  setProfile: (patch: Partial<WorkspaceProfile>) => void;
  completeOnboarding: () => void;
  addKnowledge: (e: Omit<KnowledgeEntry, "id" | "updatedAt">) => void;
  updateKnowledge: (id: string, patch: Partial<Omit<KnowledgeEntry, "id">>) => void;
  removeKnowledge: (id: string) => void;
  addRecent: (item: Omit<RecentItem, "id" | "updatedAt">) => void;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

type WorkspaceResponse = {
  workspace: {
    id: string;
    profile: WorkspaceProfile;
    plan: Plan;
    creditsIncluded: number;
    creditsBought: number;
    creditsUsed: number;
    remaining: number;
  };
  knowledge: Array<{
    id: string;
    title: string;
    body: string;
    tags: string[];
    updatedAt: string;
  }>;
  ledger: Array<{ id: string; delta: number; reason: string; createdAt: string }>;
  recent: Array<{
    id: string;
    kind: "proposal" | "rfp" | "contract";
    title: string;
    status: string;
    updatedAt: number;
  }>;
  isAdmin?: boolean;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [creditsBought, setCreditsBought] = useState(0);
  const [status, setStatus] = useState<AppContextValue["status"]>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAdminFlag, setIsAdminFlag] = useState(false);

  const remaining = Math.max(0, state.creditsIncluded + creditsBought - state.creditsUsed);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace", { cache: "no-store" });
      if (res.status === 401) {
        setStatus("unauthenticated");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMessage(
          data?.error === "database_not_configured"
            ? "The database isn't connected yet. Set DATABASE_URL on Vercel, then hit /api/admin/db-setup with your SETUP_TOKEN to create the tables."
            : `Workspace fetch failed (${res.status}).`,
        );
        return;
      }
      const data = (await res.json()) as WorkspaceResponse;
      const knowledge: KnowledgeEntry[] = data.knowledge.map((k) => ({
        id: k.id,
        title: k.title,
        body: k.body,
        tags: k.tags ?? [],
        updatedAt: +new Date(k.updatedAt),
      }));
      const ledger: LedgerEntry[] = data.ledger.map((l) => ({
        id: l.id,
        delta: l.delta,
        reason: l.reason,
        at: +new Date(l.createdAt),
      }));
      const recent: RecentItem[] = data.recent.map((r) => ({
        id: r.id,
        kind: r.kind,
        title: r.title,
        status: (r.status as RecentItem["status"]) || "draft",
        updatedAt: r.updatedAt,
      }));
      setState({
        profile: data.workspace.profile,
        plan: data.workspace.plan,
        creditsIncluded: data.workspace.creditsIncluded,
        creditsUsed: data.workspace.creditsUsed,
        knowledge,
        recent,
        ledger,
      });
      setCreditsBought(data.workspace.creditsBought);
      setIsAdminFlag(Boolean(data.isAdmin));
      setStatus("ready");
    } catch (e) {
      setStatus("error");
      setErrorMessage(`Workspace fetch failed: ${String(e)}`);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (status === "unauthenticated" && typeof window !== "undefined") {
      const callback = encodeURIComponent(window.location.pathname);
      window.location.href = `/signin?callbackUrl=${callback}`;
    }
  }, [status]);

  const spend: AppContextValue["spend"] = (amount, reason) => {
    if (amount <= 0) return true;
    if (remaining < amount) return false;
    setState((s) => ({
      ...s,
      creditsUsed: s.creditsUsed + amount,
      ledger: [{ id: uid(), delta: -amount, reason, at: Date.now() }, ...s.ledger],
    }));
    void fetch("/api/credits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount, reason }),
    })
      .then((res) => {
        if (!res.ok) {
          // Rollback optimistic update on failure
          setState((s) => ({
            ...s,
            creditsUsed: Math.max(0, s.creditsUsed - amount),
            ledger: s.ledger.filter((l) => !(l.delta === -amount && l.reason === reason)).slice(0),
          }));
        }
      })
      .catch(() => {
        /* network blip — leave optimistic in place; refresh() will reconcile */
      });
    return true;
  };

  const setProfile: AppContextValue["setProfile"] = (patch) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
    void fetch("/api/workspace", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
  };

  const completeOnboarding: AppContextValue["completeOnboarding"] = () => {
    setState((s) => ({ ...s, profile: { ...s.profile, onboardingComplete: true } }));
    void fetch("/api/workspace", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ onboardingComplete: true }),
    });
  };

  const addKnowledge: AppContextValue["addKnowledge"] = (e) => {
    const tempId = uid();
    setState((s) => ({
      ...s,
      knowledge: [{ ...e, id: tempId, updatedAt: Date.now() }, ...s.knowledge],
    }));
    void fetch("/api/knowledge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(e),
    })
      .then(async (res) => {
        if (res.ok) {
          const { entry } = await res.json();
          setState((s) => ({
            ...s,
            knowledge: s.knowledge.map((k) =>
              k.id === tempId ? { ...k, id: entry.id, updatedAt: +new Date(entry.updatedAt) } : k,
            ),
          }));
        } else {
          setState((s) => ({ ...s, knowledge: s.knowledge.filter((k) => k.id !== tempId) }));
        }
      })
      .catch(() => {
        /* leave optimistic; refresh will reconcile */
      });
  };

  const updateKnowledge: AppContextValue["updateKnowledge"] = (id, patch) => {
    setState((s) => ({
      ...s,
      knowledge: s.knowledge.map((k) => (k.id === id ? { ...k, ...patch, updatedAt: Date.now() } : k)),
    }));
    void fetch(`/api/knowledge/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
  };

  const removeKnowledge: AppContextValue["removeKnowledge"] = (id) => {
    setState((s) => ({ ...s, knowledge: s.knowledge.filter((k) => k.id !== id) }));
    void fetch(`/api/knowledge/${id}`, { method: "DELETE" });
  };

  const addRecent: AppContextValue["addRecent"] = (item) => {
    // Local-only for now until proposal/rfp/contract API routes exist.
    // Once those exist, the server will be the source of truth.
    setState((s) => ({
      ...s,
      recent: [{ ...item, id: uid(), updatedAt: Date.now() }, ...s.recent].slice(0, 12),
    }));
  };

  const body =
    status === "loading" ? (
      <LoadingScreen />
    ) : status === "unauthenticated" ? (
      <LoadingScreen label="Redirecting to sign in…" />
    ) : status === "error" ? (
      <ErrorScreen message={errorMessage} onRetry={() => { setStatus("loading"); void refresh(); }} />
    ) : (
      children
    );

  return (
    <AppContext.Provider
      value={{
        ...state,
        remaining,
        status,
        errorMessage,
        isAdmin: isAdminFlag,
        spend,
        setProfile,
        completeOnboarding,
        addKnowledge,
        updateKnowledge,
        removeKnowledge,
        addRecent,
        refresh,
      }}
    >
      {body}
    </AppContext.Provider>
  );
}

function LoadingScreen({ label = "Loading your workspace…" }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-3 text-ink-500">
        <span className="flex h-5 items-center gap-[4px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-[3px] origin-center rounded-full bg-gradient-to-b from-silk-peri to-silk-blush animate-eq"
              style={{ height: "100%", animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </span>
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <div className="card p-7">
        <h1 className="text-lg font-semibold text-ink-900">Workspace unavailable</h1>
        <p className="mt-2 text-sm text-ink-500">
          {message ?? "Something went wrong while loading your workspace."}
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={onRetry} className="btn-dark py-2.5 text-[13px]">
            Try again
          </button>
          <a href="/api/health/auth" className="btn-soft py-2.5 text-[13px]" target="_blank" rel="noopener noreferrer">
            Diagnostics
          </a>
        </div>
      </div>
    </div>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
