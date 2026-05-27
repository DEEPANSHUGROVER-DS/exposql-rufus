export type Tone = "Formal" | "Friendly" | "Concise";
export type Plan = "free" | "starter" | "growth" | "scale";

export interface WorkspaceProfile {
  companyName: string;
  website: string;
  industry: string;
  services: string[];
  currency: string;
  defaultTone: Tone;
  clientType: string;
  onboardingComplete: boolean;
  // brand kit
  primaryColor: string;
  accentColor: string;
  theme: "Light" | "Warm" | "Bold";
  logoUrl: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  body: string;
  tags: string[];
  updatedAt: number;
}

export type ItemKind = "proposal" | "rfp" | "contract";
export type ItemStatus = "draft" | "sent" | "won" | "lost" | "completed" | "in_review";

export interface RecentItem {
  id: string;
  kind: ItemKind;
  title: string;
  status: ItemStatus;
  updatedAt: number;
}

export interface LedgerEntry {
  id: string;
  delta: number; // negative = spend, positive = purchase/grant
  reason: string;
  at: number;
}

export interface AppState {
  profile: WorkspaceProfile;
  plan: Plan;
  creditsIncluded: number;
  creditsUsed: number;
  knowledge: KnowledgeEntry[];
  recent: RecentItem[];
  ledger: LedgerEntry[];
}

export const creditsRemaining = (s: AppState) => Math.max(0, s.creditsIncluded - s.creditsUsed);
