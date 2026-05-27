"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AppState, KnowledgeEntry, RecentItem, WorkspaceProfile } from "@/lib/app/types";
import { seedState } from "@/lib/app/seed";

const KEY = "rufus.app.v1";

interface AppContextValue extends AppState {
  remaining: number;
  spend: (amount: number, reason: string) => boolean;
  grant: (amount: number, reason: string) => void;
  setProfile: (patch: Partial<WorkspaceProfile>) => void;
  completeOnboarding: () => void;
  addKnowledge: (e: Omit<KnowledgeEntry, "id" | "updatedAt">) => void;
  updateKnowledge: (id: string, patch: Partial<Omit<KnowledgeEntry, "id">>) => void;
  removeKnowledge: (id: string) => void;
  addRecent: (item: Omit<RecentItem, "id" | "updatedAt">) => void;
  reset: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const remaining = Math.max(0, state.creditsIncluded - state.creditsUsed);

  const spend = (amount: number, reason: string) => {
    if (amount <= 0) return true;
    let ok = false;
    setState((s) => {
      const rem = Math.max(0, s.creditsIncluded - s.creditsUsed);
      if (rem < amount) return s;
      ok = true;
      return {
        ...s,
        creditsUsed: s.creditsUsed + amount,
        ledger: [{ id: uid(), delta: -amount, reason, at: Date.now() }, ...s.ledger],
      };
    });
    return ok;
  };

  const grant = (amount: number, reason: string) =>
    setState((s) => ({
      ...s,
      creditsIncluded: s.creditsIncluded + amount,
      ledger: [{ id: uid(), delta: amount, reason, at: Date.now() }, ...s.ledger],
    }));

  const setProfile = (patch: Partial<WorkspaceProfile>) =>
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));

  const completeOnboarding = () =>
    setState((s) => ({ ...s, profile: { ...s.profile, onboardingComplete: true } }));

  const addKnowledge = (e: Omit<KnowledgeEntry, "id" | "updatedAt">) =>
    setState((s) => ({
      ...s,
      knowledge: [{ ...e, id: uid(), updatedAt: Date.now() }, ...s.knowledge],
    }));

  const updateKnowledge = (id: string, patch: Partial<Omit<KnowledgeEntry, "id">>) =>
    setState((s) => ({
      ...s,
      knowledge: s.knowledge.map((k) => (k.id === id ? { ...k, ...patch, updatedAt: Date.now() } : k)),
    }));

  const removeKnowledge = (id: string) =>
    setState((s) => ({ ...s, knowledge: s.knowledge.filter((k) => k.id !== id) }));

  const addRecent = (item: Omit<RecentItem, "id" | "updatedAt">) =>
    setState((s) => ({ ...s, recent: [{ ...item, id: uid(), updatedAt: Date.now() }, ...s.recent].slice(0, 12) }));

  const reset = () => setState(seedState);

  return (
    <AppContext.Provider
      value={{
        ...state,
        remaining,
        spend,
        grant,
        setProfile,
        completeOnboarding,
        addKnowledge,
        updateKnowledge,
        removeKnowledge,
        addRecent,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
