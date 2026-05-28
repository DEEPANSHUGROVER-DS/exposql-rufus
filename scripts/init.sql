-- Rufus — initial Postgres schema for Neon.
-- Paste this into the Neon SQL editor, or pipe it through psql:
--   psql "$DATABASE_URL" -f scripts/init.sql
-- Idempotent (uses IF NOT EXISTS) so it's safe to re-run.

-- NextAuth shape (used even though we run JWT sessions, so first-sign-in
-- can upsert user + workspace by email).
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text,
  "email" text NOT NULL UNIQUE,
  "emailVerified" timestamp,
  "image" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "account" (
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "providerAccountId" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  PRIMARY KEY ("provider", "providerAccountId")
);

CREATE TABLE IF NOT EXISTS "session" (
  "sessionToken" text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expires" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "verificationToken" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

-- Rufus domain
CREATE TABLE IF NOT EXISTS "workspace" (
  "id" text PRIMARY KEY,
  "owner_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "company_name" text NOT NULL DEFAULT '',
  "website" text NOT NULL DEFAULT '',
  "industry" text NOT NULL DEFAULT '',
  "services" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "currency" text NOT NULL DEFAULT 'USD',
  "default_tone" text NOT NULL DEFAULT 'Friendly',
  "client_type" text NOT NULL DEFAULT '',
  "onboarding_completed_at" timestamp,
  "plan" text NOT NULL DEFAULT 'free',
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "subscription_status" text,
  "current_period_end" timestamp,
  "credits_included" integer NOT NULL DEFAULT 20,
  "credits_bought" integer NOT NULL DEFAULT 0,
  "credits_used" integer NOT NULL DEFAULT 0,
  "logo_url" text NOT NULL DEFAULT '',
  "primary_color" text NOT NULL DEFAULT '#1B1A16',
  "accent_color" text NOT NULL DEFAULT '#5b5bd6',
  "theme" text NOT NULL DEFAULT 'Warm',
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "workspace_owner_idx" ON "workspace" ("owner_id");
CREATE INDEX IF NOT EXISTS "workspace_stripe_sub_idx" ON "workspace" ("stripe_subscription_id");

CREATE TABLE IF NOT EXISTS "knowledge_entry" (
  "id" text PRIMARY KEY,
  "workspace_id" text NOT NULL REFERENCES "workspace"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "body" text NOT NULL DEFAULT '',
  "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "knowledge_workspace_idx" ON "knowledge_entry" ("workspace_id");

CREATE TABLE IF NOT EXISTS "proposal" (
  "id" text PRIMARY KEY,
  "workspace_id" text NOT NULL REFERENCES "workspace"("id") ON DELETE CASCADE,
  "client_name" text NOT NULL,
  "title" text NOT NULL,
  "sections" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "pricing" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" text NOT NULL DEFAULT 'draft',
  "hosted_slug" text UNIQUE,
  "viewed_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "proposal_workspace_idx" ON "proposal" ("workspace_id");

CREATE TABLE IF NOT EXISTS "rfp_response" (
  "id" text PRIMARY KEY,
  "workspace_id" text NOT NULL REFERENCES "workspace"("id") ON DELETE CASCADE,
  "title" text NOT NULL DEFAULT 'RFP response',
  "source_text" text NOT NULL,
  "answers" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" text NOT NULL DEFAULT 'draft',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "rfp_workspace_idx" ON "rfp_response" ("workspace_id");

CREATE TABLE IF NOT EXISTS "contract_review" (
  "id" text PRIMARY KEY,
  "workspace_id" text NOT NULL REFERENCES "workspace"("id") ON DELETE CASCADE,
  "title" text NOT NULL DEFAULT 'Contract review',
  "file_name" text NOT NULL DEFAULT '',
  "summary" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "red_flags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "suggested_edits" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "contract_workspace_idx" ON "contract_review" ("workspace_id");

CREATE TABLE IF NOT EXISTS "credit_ledger" (
  "id" text PRIMARY KEY,
  "workspace_id" text NOT NULL REFERENCES "workspace"("id") ON DELETE CASCADE,
  "delta" integer NOT NULL,
  "reason" text NOT NULL,
  "source" text NOT NULL,
  "ref_id" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "ledger_workspace_idx" ON "credit_ledger" ("workspace_id");

CREATE TABLE IF NOT EXISTS "credit_purchase" (
  "id" text PRIMARY KEY,
  "workspace_id" text NOT NULL REFERENCES "workspace"("id") ON DELETE CASCADE,
  "stripe_session_id" text NOT NULL UNIQUE,
  "pack_key" text NOT NULL,
  "credits" integer NOT NULL,
  "amount" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "purchase_workspace_idx" ON "credit_purchase" ("workspace_id");
