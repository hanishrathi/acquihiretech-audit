/**
 * Supabase-backed audit storage.
 * Replaces the in-memory Map with persistent storage.
 *
 * Falls back to in-memory store if Supabase env vars are not configured
 * (useful for local dev or first-deploy before env vars are set).
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Environment & Client ────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceKey);

let supabaseClient: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  supabaseClient = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { persistSession: false },
  });
}

// In-memory fallback (for local dev / pre-Supabase deployments)
const memoryStore = new Map<string, AuditRecord>();

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuditRecord {
  id: string;
  url: string;
  email: string;
  status: "queued" | "crawling" | "analyzing" | "complete" | "failed";
  tier: "basic" | "starter" | "pro";
  result: any;
  createdAt: string;
}

// ─── API ────────────────────────────────────────────────────────────────────

export async function saveAudit(record: AuditRecord): Promise<void> {
  // Always update memory store (for fast same-request reads)
  memoryStore.set(record.id, record);

  if (!supabaseClient) return;

  try {
    // Upsert audit run (project_id null for anonymous free-tier audits)
    await supabaseClient.from("audit_runs").upsert(
      {
        id: record.id,
        project_id: null,
        email: record.email,
        url: record.url,
        status: record.status,
        tier: record.tier,
        pages_crawled: record.result?.metadata?.pagesCrawled || 0,
        pages_limit: 1,
        overall_score: record.result?.overallScore || null,
        scores: record.result?.scores || null,
        metadata: record.result?.metadata || null,
        started_at: record.createdAt,
        completed_at:
          record.status === "complete" || record.status === "failed"
            ? new Date().toISOString()
            : null,
      },
      { onConflict: "id", ignoreDuplicates: false }
    );

    // Save individual issues for full report retrieval (Pro feature foundation)
    if (record.status === "complete" && record.result?.issues?.length) {
      const issuesToInsert = record.result.issues
        .filter((i: any) => i.severity !== "passed")
        .slice(0, 100) // cap to avoid bloat
        .map((i: any) => ({
          audit_run_id: record.id,
          page_url: i.pageUrl || record.url,
          category: i.category,
          severity: i.severity,
          check_id: i.checkId,
          title: i.title,
          description: i.description || null,
          suggestion: i.suggestion || null,
          fix_guide: i.fixGuide || null,
          revenue_impact: i.revenueImpact || null,
          raw_data: i.rawData || null,
        }));
      if (issuesToInsert.length) {
        await supabaseClient.from("issues").insert(issuesToInsert);
      }
    }

    // Save email lead (for marketing funnel)
    if (record.status === "complete" && record.email) {
      await supabaseClient.from("email_leads").upsert(
        {
          email: record.email,
          domain: record.result?.metadata?.domain || null,
          overall_score: record.result?.overallScore || null,
          source: "audit",
        },
        { onConflict: "email", ignoreDuplicates: true }
      );
    }
  } catch (error) {
    // Log but don't fail — memory store is still working
    console.error("[supabase] saveAudit error:", error);
  }
}

export async function getAudit(id: string): Promise<AuditRecord | null> {
  // Try memory first (fast)
  const cached = memoryStore.get(id);
  if (cached) return cached;

  if (!supabaseClient) return null;

  try {
    const { data, error } = await supabaseClient
      .from("audit_runs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const record: AuditRecord = {
      id: data.id,
      url: data.metadata?.url || "",
      email: data.metadata?.email || "",
      status: data.status,
      tier: data.tier,
      result: {
        overallScore: data.overall_score,
        scores: data.scores,
        metadata: data.metadata,
        // Note: full issues are not re-hydrated yet — would need separate query
        // For MVP, results are read from memory store within same Vercel function instance
      },
      createdAt: data.started_at || new Date().toISOString(),
    };

    // Cache for subsequent reads
    memoryStore.set(id, record);
    return record;
  } catch (error) {
    console.error("[supabase] getAudit error:", error);
    return null;
  }
}

export function isSupabaseReady(): boolean {
  return isSupabaseConfigured;
}
