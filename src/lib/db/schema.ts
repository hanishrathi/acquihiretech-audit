import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  decimal,
  jsonb,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Users (synced from Clerk via webhook) ───────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  plan: text("plan").default("free").notNull(), // free | starter | pro | agency
  planExpiresAt: timestamp("plan_expires_at", { withTimezone: true }),
  crawlsRemaining: integer("crawls_remaining").default(3),
  razorpayCustomerId: text("razorpay_customer_id"),
  stripeCustomerId: text("stripe_customer_id"),
  country: text("country").default("IN"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Projects (a website being audited) ──────────────────────────────────────

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    domain: text("domain").notNull(),
    name: text("name"),
    faviconUrl: text("favicon_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userDomainIdx: uniqueIndex("user_domain_idx").on(table.userId, table.domain),
  })
);

// ─── Audit Runs (each crawl execution) ──────────────────────────────────────

export const auditRuns = pgTable("audit_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  status: text("status").default("queued").notNull(), // queued | crawling | analyzing | complete | failed
  tier: text("tier").notNull(), // basic | starter | pro
  pagesCrawled: integer("pages_crawled").default(0),
  pagesLimit: integer("pages_limit").notNull(),
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  scores: jsonb("scores"), // { performance: 72, seo: 85, mobile: 90, ... }
  metadata: jsonb("metadata"), // { totalIssues, criticalCount, domain, etc. }
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Page Results (per-page analysis) ────────────────────────────────────────

export const pageResults = pgTable("page_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditRunId: uuid("audit_run_id")
    .references(() => auditRuns.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  statusCode: integer("status_code"),
  loadTimeMs: integer("load_time_ms"),
  contentSize: integer("content_size"), // bytes
  scores: jsonb("scores"), // per-category scores for this page
  issues: jsonb("issues"), // [{category, severity, checkId, message, suggestion, codeFix}]
  metadata: jsonb("metadata"), // {title, description, h1, wordCount, images, links, etc.}
  screenshotUrl: text("screenshot_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Issues (denormalized for fast queries & filtering) ─────────────────────

export const issues = pgTable("issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditRunId: uuid("audit_run_id")
    .references(() => auditRuns.id, { onDelete: "cascade" })
    .notNull(),
  pageUrl: text("page_url"),
  category: text("category").notNull(),
  severity: text("severity").notNull(), // critical | warning | info | passed
  checkId: text("check_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  suggestion: text("suggestion"), // shown to starter+
  fixGuide: text("fix_guide"), // shown to pro only (markdown with code)
  revenueImpact: text("revenue_impact"), // shown to pro only
  rawData: jsonb("raw_data"), // technical details for debugging
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Competitors ─────────────────────────────────────────────────────────────

export const competitors = pgTable("competitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  competitorDomain: text("competitor_domain").notNull(),
  latestScores: jsonb("latest_scores"),
  lastCrawledAt: timestamp("last_crawled_at", { withTimezone: true }),
});

// ─── Monitors (scheduled re-crawls) ─────────────────────────────────────────

export const monitors = pgTable("monitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  frequency: text("frequency").notNull(), // daily | weekly | monthly
  alertThreshold: decimal("alert_threshold", { precision: 5, scale: 2 }),
  alertEmail: text("alert_email"),
  nextRunAt: timestamp("next_run_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
});

// ─── Email Leads (free tier email capture) ──────────────────────────────────

export const emailLeads = pgTable("email_leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  domain: text("domain"), // the site they audited
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  source: text("source").default("audit"), // audit | newsletter | referral
  convertedToUser: boolean("converted_to_user").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Types ──────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type AuditRun = typeof auditRuns.$inferSelect;
export type PageResult = typeof pageResults.$inferSelect;
export type Issue = typeof issues.$inferSelect;
export type Monitor = typeof monitors.$inferSelect;
export type EmailLead = typeof emailLeads.$inferSelect;

export type AuditCategory =
  | "performance"
  | "seo"
  | "accessibility"
  | "security"
  | "mobile"
  | "content"
  | "technical"
  | "ai-readiness"
  | "conversion"
  | "brand";

export type IssueSeverity = "critical" | "warning" | "info" | "passed";

export type AuditTier = "basic" | "starter" | "pro";

export type AuditScores = Record<AuditCategory, number>;
