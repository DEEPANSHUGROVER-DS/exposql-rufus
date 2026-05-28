import { pgTable, text, integer, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";

// ---------- NextAuth shape (kept even though we use JWT sessions, so we can
// store user/account records ourselves on first sign-in) ----------

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.provider, t.providerAccountId] }) }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.identifier, t.token] }) }),
);

// ---------- Rufus domain ----------

export const workspaces = pgTable("workspace", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // profile
  companyName: text("company_name").notNull().default(""),
  website: text("website").notNull().default(""),
  industry: text("industry").notNull().default(""),
  services: jsonb("services").$type<string[]>().notNull().default([]),
  currency: text("currency").notNull().default("USD"),
  defaultTone: text("default_tone").notNull().default("Friendly"),
  clientType: text("client_type").notNull().default(""),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),

  // plan
  plan: text("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"),
  currentPeriodEnd: timestamp("current_period_end"),

  // credits
  creditsIncluded: integer("credits_included").notNull().default(20),
  creditsBought: integer("credits_bought").notNull().default(0),
  creditsUsed: integer("credits_used").notNull().default(0),

  // brand kit
  logoUrl: text("logo_url").notNull().default(""),
  primaryColor: text("primary_color").notNull().default("#1B1A16"),
  accentColor: text("accent_color").notNull().default("#5b5bd6"),
  theme: text("theme").notNull().default("Warm"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const knowledgeEntries = pgTable("knowledge_entry", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PricingRow = { id: number; item: string; qty: number; price: number };

export const proposals = pgTable("proposal", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  title: text("title").notNull(),
  scope: text("scope").notNull().default(""),
  timeline: text("timeline").notNull().default(""),
  tone: text("tone").notNull().default("Friendly"),
  sections: jsonb("sections").$type<Record<string, string>>().notNull().default({}),
  pricing: jsonb("pricing").$type<PricingRow[]>().notNull().default([]),
  status: text("status").notNull().default("draft"),
  hostedSlug: text("hosted_slug").unique(),
  viewedAt: timestamp("viewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type RfpAnswer = {
  question: string;
  answer: string;
  confidence: "high" | "medium" | "low";
  sourceEntryId: string | null;
  approved: boolean;
};

export const rfpResponses = pgTable("rfp_response", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("RFP response"),
  sourceText: text("source_text").notNull(),
  answers: jsonb("answers").$type<RfpAnswer[]>().notNull().default([]),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type RedFlag = { severity: "high" | "medium" | "low"; clause: string; reason: string };
export type SuggestedEdit = { original: string; replacement: string; reason: string };

export const contractReviews = pgTable("contract_review", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Contract review"),
  fileName: text("file_name").notNull().default(""),
  sourceText: text("source_text").notNull().default(""),
  summary: jsonb("summary").$type<string[]>().notNull().default([]),
  redFlags: jsonb("red_flags").$type<RedFlag[]>().notNull().default([]),
  suggestedEdits: jsonb("suggested_edits").$type<SuggestedEdit[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creditLedger = pgTable("credit_ledger", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  source: text("source").notNull(),
  refId: text("ref_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creditPurchases = pgTable("credit_purchase", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  packKey: text("pack_key").notNull(),
  credits: integer("credits").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type WorkspaceRow = typeof workspaces.$inferSelect;
export type KnowledgeEntryRow = typeof knowledgeEntries.$inferSelect;
export type LedgerRow = typeof creditLedger.$inferSelect;
export type ProposalRow = typeof proposals.$inferSelect;
export type RfpResponseRow = typeof rfpResponses.$inferSelect;
export type ContractReviewRow = typeof contractReviews.$inferSelect;
