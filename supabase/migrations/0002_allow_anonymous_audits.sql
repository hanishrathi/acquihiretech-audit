-- =============================================================================
-- AcquiHire Audit Engine — Migration 0002
-- Allow anonymous (email-only) free-tier audits
--
-- Run this in Supabase SQL Editor AFTER 0001_initial_schema.sql
-- =============================================================================

-- Make project_id nullable so we can store free-tier audits without requiring
-- a full user/project record. Paid users still get full project linkage.
ALTER TABLE audit_runs
  ALTER COLUMN project_id DROP NOT NULL;

-- Add direct email + url columns for anonymous lookups
-- (We store these in metadata JSONB too, but having columns makes queries fast)
ALTER TABLE audit_runs
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_runs_email ON audit_runs(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_runs_url ON audit_runs(url) WHERE url IS NOT NULL;

-- Same nullable adjustment for issues (anonymous audits attach issues directly)
-- Issues already reference audit_runs which is fine

-- Verify with:
-- SELECT column_name, is_nullable FROM information_schema.columns
-- WHERE table_name = 'audit_runs' AND column_name IN ('project_id', 'email', 'url');
