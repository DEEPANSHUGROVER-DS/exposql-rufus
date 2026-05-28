-- Migration 001: store source inputs alongside generated outputs so saved
-- items can be reopened with full context (and follow-ups still work).
--
-- Idempotent. Run once in the Neon SQL editor on any DB that was
-- bootstrapped before this migration landed. New installs already have
-- these columns via scripts/init.sql.

ALTER TABLE "proposal" ADD COLUMN IF NOT EXISTS "scope" text NOT NULL DEFAULT '';
ALTER TABLE "proposal" ADD COLUMN IF NOT EXISTS "timeline" text NOT NULL DEFAULT '';
ALTER TABLE "proposal" ADD COLUMN IF NOT EXISTS "tone" text NOT NULL DEFAULT 'Friendly';

ALTER TABLE "contract_review" ADD COLUMN IF NOT EXISTS "source_text" text NOT NULL DEFAULT '';
