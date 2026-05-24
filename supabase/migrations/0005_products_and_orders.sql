-- =============================================================================
-- AcquiHire Audit Engine — Migration 0005
-- Extend pending_payments to support digital product orders in addition to plans
-- =============================================================================

-- Drop existing plan_id NOT NULL + CHECK so we can allow product orders too
ALTER TABLE pending_payments
  ALTER COLUMN plan_id DROP NOT NULL;

ALTER TABLE pending_payments
  DROP CONSTRAINT IF EXISTS pending_payments_plan_id_check;

-- Add product columns
ALTER TABLE pending_payments
  ADD COLUMN IF NOT EXISTS product_slug TEXT,
  ADD COLUMN IF NOT EXISTS product_quantity INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS download_url TEXT,
  ADD COLUMN IF NOT EXISTS download_emailed_at TIMESTAMPTZ;

-- Re-add the plan_id value check but allow NULL (product orders have no plan)
ALTER TABLE pending_payments
  ADD CONSTRAINT pending_payments_plan_id_values_check
  CHECK (plan_id IS NULL OR plan_id IN ('starter', 'pro', 'agency'));

-- Exactly one of (plan_id, product_slug) must be set
ALTER TABLE pending_payments
  ADD CONSTRAINT pending_payments_item_check
  CHECK (
    (plan_id IS NOT NULL AND product_slug IS NULL)
    OR (plan_id IS NULL AND product_slug IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_pending_payments_product_slug
  ON pending_payments(product_slug) WHERE product_slug IS NOT NULL;
