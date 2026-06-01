-- Migration 003: switch the default to pay-as-you-go.
--
-- New workspaces no longer get 20 free credits at signup — they have to
-- buy a credit pack or subscribe. Existing workspaces keep whatever
-- balance they had.
--
-- Idempotent. Safe to re-run.

ALTER TABLE "workspace" ALTER COLUMN "credits_included" SET DEFAULT 0;
