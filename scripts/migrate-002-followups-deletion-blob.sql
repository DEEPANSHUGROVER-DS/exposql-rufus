-- Migration 002: persist contract follow-ups + add account_deletion_requested_at
-- (used by the self-serve account deletion flow so we can hold-then-purge).
-- Idempotent.

ALTER TABLE "contract_review" ADD COLUMN IF NOT EXISTS "followups" jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "workspace" ADD COLUMN IF NOT EXISTS "deletion_requested_at" timestamp;
ALTER TABLE "workspace" ADD COLUMN IF NOT EXISTS "logo_blob_url" text;
