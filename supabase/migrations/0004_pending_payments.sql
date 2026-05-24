-- =============================================================================
-- AcquiHire Audit Engine — Migration 0004
-- Pending payments table for UPI + Crypto manual verification flows
-- =============================================================================

CREATE TABLE IF NOT EXISTS pending_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('starter', 'pro', 'agency')),
  method TEXT NOT NULL CHECK (method IN ('upi', 'crypto')),
  amount_inr INT NOT NULL,        -- in paise (e.g. 149900 = ₹1,499)
  -- UPI-specific
  upi_reference TEXT,             -- our generated reference shown to the user
  upi_utr TEXT,                   -- user-submitted UTR from their UPI app
  -- Crypto-specific
  crypto_chain TEXT,              -- 'btc' | 'eth' | 'usdc-eth' | 'usdc-polygon'
  crypto_address TEXT,            -- the address we asked them to pay to
  crypto_tx_hash TEXT,            -- user-submitted on-chain tx hash
  crypto_amount_native TEXT,      -- the crypto amount we quoted (e.g. "0.00023")
  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'awaiting_payment'
    CHECK (status IN ('awaiting_payment', 'submitted', 'approved', 'rejected', 'expired')),
  rejection_reason TEXT,
  reviewed_by TEXT,               -- admin email
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON pending_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_created_at ON pending_payments(created_at DESC);

ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;
