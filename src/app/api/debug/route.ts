import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getLastSupabaseError } from "@/lib/db/audit-store";

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
  };

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
