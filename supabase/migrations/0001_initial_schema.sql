-- =============================================================================
-- AcquiHire Audit Engine — Initial Schema
-- Run this in Supabase SQL Editor (SQL Editor → New query → paste → Run)
-- =============================================================================

-- Enable UUID extension (Supabase usually has this enabled already)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USERS (synced from Clerk via webhook)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free' NOT NULL CHECK (plan IN ('free', 'starter', 'pro', 'agency')),
  plan_expires_at TIMESTAMPTZ,
  crawls_remaining INT DEFAULT 3,
  razorpay_customer_id TEXT,
  stripe_customer_id TEXT,
  country TEXT DEFAULT 'IN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- =============================================================================
-- PROJECTS (a website being audited)
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  name TEXT,
  favicon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- =============================================================================
-- AUDIT RUNS (each crawl execution)
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'queued' NOT NULL CHECK (status IN ('queued', 'crawling', 'analyzing', 'complete', 'failed')),
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'starter', 'pro')),
  pages_crawled INT DEFAULT 0,
  pages_limit INT NOT NULL,
  overall_score DECIMAL(5,2),
  scores JSONB,
  metadata JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_runs_project_id ON audit_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_runs_status ON audit_runs(status);
CREATE INDEX IF NOT EXISTS idx_audit_runs_created_at ON audit_runs(created_at DESC);

-- =============================================================================
-- PAGE RESULTS (per-page analysis)
-- =============================================================================
CREATE TABLE IF NOT EXISTS page_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_run_id UUID REFERENCES audit_runs(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  status_code INT,
  load_time_ms INT,
  content_size INT,
  scores JSONB,
  issues JSONB,
  metadata JSONB,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_results_audit_run_id ON page_results(audit_run_id);

-- =============================================================================
-- ISSUES (denormalized for fast queries & filtering)
-- =============================================================================
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_run_id UUID REFERENCES audit_runs(id) ON DELETE CASCADE NOT NULL,
  page_url TEXT,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info', 'passed')),
  check_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  suggestion TEXT,
  fix_guide TEXT,
  revenue_impact TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issues_audit_run_id ON issues(audit_run_id);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON issues(severity);

-- =============================================================================
-- COMPETITORS (for competitor comparison feature)
-- =============================================================================
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  competitor_domain TEXT NOT NULL,
  latest_scores JSONB,
  last_crawled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_competitors_project_id ON competitors(project_id);

-- =============================================================================
-- MONITORS (scheduled re-crawls for Starter+ tiers)
-- =============================================================================
CREATE TABLE IF NOT EXISTS monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  alert_threshold DECIMAL(5,2),
  alert_email TEXT,
  next_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_monitors_next_run_at ON monitors(next_run_at) WHERE is_active = true;

-- =============================================================================
-- EMAIL LEADS (free tier email capture funnel)
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  domain TEXT,
  overall_score DECIMAL(5,2),
  source TEXT DEFAULT 'audit',
  converted_to_user BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_leads_email ON email_leads(email);
CREATE INDEX IF NOT EXISTS idx_email_leads_created_at ON email_leads(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_leads ENABLE ROW LEVEL SECURITY;

-- Service role can do anything (used by server-side API routes)
-- Anon role gets no direct access — all client operations go through API routes
-- Add user-scoped policies later once Clerk integration is wired up

-- =============================================================================
-- DONE
-- =============================================================================
-- Verify with: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
