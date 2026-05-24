import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getLastSupabaseError } from "@/lib/db/audit-store";

/**
 * Reports a 3-key integration status without leaking secret values.
 * Each key shows ✅/❌ — and the overall status is "ready" only if all 3 present.
 */
function maskStatus(
  key1?: string,
  key2?: string,
  key3?: string
): { status: string; keys: string[] } {
  const present = [Boolean(key1), Boolean(key2), Boolean(key3)];
  const count = present.filter(Boolean).length;
  return {
    status:
      count === 3
        ? "✅ fully configured"
        : count === 0
          ? "❌ not configured"
          : `⚠️ partial (${count}/3 keys)`,
    keys: present.map((p, i) => `key${i + 1}: ${p ? "✅" : "❌"}`),
  };
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const report: Record<string, any> = {
    timestamp: new Date().toISOString(),
    lastAuditStoreError: getLastSupabaseError(),
    deployment: {
      vercelEnv: process.env.VERCEL_ENV || "unknown",
      vercelRegion: process.env.VERCEL_REGION || "unknown",
      vercelUrl: process.env.VERCEL_URL || "unknown",
    },
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: url ? `${url.slice(0, 30)}...` : "❌ MISSING",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey
        ? `${anonKey.slice(0, 20)}... (${anonKey.length} chars)`
        : "❌ MISSING",
      SUPABASE_SERVICE_ROLE_KEY: serviceKey
        ? `${serviceKey.slice(0, 20)}... (${serviceKey.length} chars)`
        : "❌ MISSING",
    },
    supabaseChecks: {
      clientCreated: false,
      audit_runs_writable: "not tested",
      audit_runs_readable: "not tested",
      email_leads_writable: "not tested",
      issues_writable: "not tested",
      schema_has_email_column: "not tested",
    },
    integrations: {
      // Auth
      clerk: maskStatus(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        process.env.CLERK_SECRET_KEY,
        process.env.CLERK_WEBHOOK_SECRET
      ),
      // Payments — Razorpay (India)
      razorpay: {
        ...maskStatus(
          process.env.RAZORPAY_KEY_ID,
          process.env.RAZORPAY_KEY_SECRET,
          process.env.RAZORPAY_WEBHOOK_SECRET
        ),
        // Key ID prefix is public (browser sees it at checkout) — safe to show
        keyIdMode: process.env.RAZORPAY_KEY_ID
          ? process.env.RAZORPAY_KEY_ID.startsWith("rzp_live")
            ? "LIVE"
            : process.env.RAZORPAY_KEY_ID.startsWith("rzp_test")
              ? "TEST"
              : "UNKNOWN PREFIX"
          : "missing",
        keyIdPrefix: process.env.RAZORPAY_KEY_ID
          ? process.env.RAZORPAY_KEY_ID.slice(0, 12)
          : "missing",
        secretLength: process.env.RAZORPAY_KEY_SECRET
          ? process.env.RAZORPAY_KEY_SECRET.length
          : 0,
      },
      // Payments — Stripe (international)
      stripe: maskStatus(
        process.env.STRIPE_SECRET_KEY,
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        process.env.STRIPE_WEBHOOK_SECRET
      ),
      // AI
      anthropic: process.env.ANTHROPIC_API_KEY ? "✅ configured" : "❌ missing",
      openai: process.env.OPENAI_API_KEY ? "✅ configured" : "❌ missing",
      // Infra
      redis: process.env.REDIS_URL ? "✅ configured" : "❌ missing",
      resend: process.env.RESEND_API_KEY ? "✅ configured" : "❌ missing",
      // Manual payments
      upi: {
        status:
          process.env.UPI_PAYEE_ID && process.env.UPI_PAYEE_NAME
            ? "✅ configured"
            : "❌ missing",
        payeeId: process.env.UPI_PAYEE_ID || "missing",
        payeeName: process.env.UPI_PAYEE_NAME || "missing",
      },
      crypto: {
        btc: process.env.CRYPTO_BTC_ADDRESS ? "✅ configured" : "❌ missing",
        eth: process.env.CRYPTO_ETH_ADDRESS ? "✅ configured" : "❌ missing",
        polygon: process.env.CRYPTO_POLYGON_ADDRESS
          ? "✅ configured"
          : "❌ missing",
      },
      admin: {
        emails: process.env.ADMIN_EMAILS || "❌ missing — set ADMIN_EMAILS",
      },
    },
  };

  // ── Live Razorpay order-creation test ──────────────────────────────────────
  // Creating an order is free and harmless (it's not a charge). This surfaces
  // the REAL Razorpay error if keys are bad / account misconfigured.
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      const Razorpay = (await import("razorpay")).default;
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const testOrder = await rzp.orders.create({
        amount: 100, // ₹1 — minimum; order != charge
        currency: "INR",
        receipt: `debug-${Date.now()}`,
      });
      report.razorpayOrderTest = {
        status: "✅ order created successfully",
        orderId: testOrder.id,
        note: "Keys are valid and the account can create orders.",
      };
    } catch (err: any) {
      report.razorpayOrderTest = {
        status: "❌ order creation FAILED",
        error: err?.error?.description || err?.message || String(err),
        statusCode: err?.statusCode,
        rawError: err?.error || null,
      };
    }
  } else {
    report.razorpayOrderTest = { status: "skipped — Razorpay keys missing" };
  }

  if (!url || !serviceKey) {
    report.supabaseChecks.clientCreated = "❌ skipped — env vars missing";
    return NextResponse.json(report, { status: 500 });
  }

  try {
    const client = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    report.supabaseChecks.clientCreated = "✅ yes";

    // Test 1: Can we read from audit_runs?
    const { data: readData, error: readError, count } = await client
      .from("audit_runs")
      .select("*", { count: "exact", head: true });

    if (readError) {
      report.supabaseChecks.audit_runs_readable = `❌ ${readError.message}`;
    } else {
      report.supabaseChecks.audit_runs_readable = `✅ ${count} existing rows`;
    }

    // Test 2: Check if migration 0002 ran (email column should exist)
    const { error: emailColError } = await client
      .from("audit_runs")
      .select("email, url")
      .limit(1);

    if (emailColError) {
      report.supabaseChecks.schema_has_email_column = `❌ ${emailColError.message} — MIGRATION 0002 NOT RUN`;
    } else {
      report.supabaseChecks.schema_has_email_column = "✅ email + url columns exist";
    }

    // Test 3: Try a real write to audit_runs
    const testId = crypto.randomUUID();
    const { error: writeError } = await client.from("audit_runs").insert({
      id: testId,
      project_id: null,
      email: "debug-test@example.com",
      url: "https://debug-test.com",
      status: "complete",
      tier: "basic",
      pages_crawled: 1,
      pages_limit: 1,
      overall_score: 75.5,
      scores: { performance: 80, seo: 70 },
      metadata: { test: true, domain: "debug-test.com" },
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    if (writeError) {
      report.supabaseChecks.audit_runs_writable = `❌ ${writeError.message} | code: ${writeError.code}`;
    } else {
      report.supabaseChecks.audit_runs_writable = `✅ wrote test row ${testId}`;

      // Cleanup test row
      await client.from("audit_runs").delete().eq("id", testId);
    }

    // Test 4: Try writing to email_leads
    const { error: emailWriteError } = await client.from("email_leads").upsert(
      {
        email: "debug-test@example.com",
        domain: "debug-test.com",
        overall_score: 75.5,
        source: "audit",
      },
      { onConflict: "email" }
    );

    if (emailWriteError) {
      report.supabaseChecks.email_leads_writable = `❌ ${emailWriteError.message}`;
    } else {
      report.supabaseChecks.email_leads_writable = "✅ wrote/upserted test email";
    }

    // Test 5: Try writing to issues
    const issueTestRunId = crypto.randomUUID();
    await client.from("audit_runs").insert({
      id: issueTestRunId,
      project_id: null,
      email: "issue-test@example.com",
      url: "https://issue-test.com",
      status: "complete",
      tier: "basic",
      pages_limit: 1,
    });
    const { error: issueWriteError } = await client.from("issues").insert({
      audit_run_id: issueTestRunId,
      page_url: "https://issue-test.com",
      category: "performance",
      severity: "warning",
      check_id: "debug-test",
      title: "Debug test issue",
      description: "Just testing writes",
    });
    if (issueWriteError) {
      report.supabaseChecks.issues_writable = `❌ ${issueWriteError.message}`;
    } else {
      report.supabaseChecks.issues_writable = "✅ wrote test issue";
    }
    // Cleanup
    await client.from("audit_runs").delete().eq("id", issueTestRunId);
  } catch (error: any) {
    report.fatalError = error.message;
  }

  return NextResponse.json(report, { status: 200 });
}
