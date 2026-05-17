-- =============================================================================
-- AcquiHire Audit Engine — Migration 0003
-- Add UNIQUE constraint on email_leads.email to support upsert-by-email
--
-- Without this, the audit-store's upsert(..., {onConflict: "email"}) fails
-- silently and lead emails don't get captured.
--
-- Run this in Supabase SQL Editor AFTER 0001 and 0002.
-- =============================================================================

-- First, deduplicate any existing rows (keep oldest record per email)
-- This is safe even on empty tables.
DELETE FROM email_leads a USING email_leads b
  WHERE a.id > b.id
    AND a.email = b.email;

-- Add the unique constraint
ALTER TABLE email_leads
  ADD CONSTRAINT email_leads_email_unique UNIQUE (email);

-- Verify with:
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'email_leads';
