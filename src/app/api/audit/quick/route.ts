import { NextResponse } from "next/server";
import { safeAuth, safeCurrentUser } from "@/lib/auth";
import { crawlSite } from "@/lib/crawler";
import { gateResultsByTier } from "@/lib/tier-gate";
import { saveAudit, getAudit, type AuditRecord } from "@/lib/db/audit-store";
import { ensureUser, getCurrentUser } from "@/lib/db/user";
import type { AuditTier } from "@/lib/db/schema";

export { getAudit, saveAudit };

function planToTier(plan: string): AuditTier {
  if (plan === "pro" || plan === "agency") return "pro";
  if (plan === "starter") return "starter";
  return "basic";
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let url: string;
    let email: string | null = null;

    // Support form posts (from dashboard) as well as JSON
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      url = String(form.get("url") || "");
    } else {
      const body = await request.json();
      url = body.url;
      email = body.email;
    }

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let normalizedUrl = url.trim();
    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Determine tier: signed-in users get their plan; anonymous users get basic
    const { userId } = await safeAuth();
    let tier: AuditTier = "basic";
    let userEmail = email;

    if (userId) {
      const clerkUser = await safeCurrentUser();
      const clerkEmail = clerkUser?.emailAddresses[0]?.emailAddress || "";
      const clerkName =
        [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
      await ensureUser(userId, clerkEmail, clerkName);
      const dbUser = await getCurrentUser();
      if (dbUser) {
        tier = planToTier(dbUser.plan);
        userEmail = userEmail || dbUser.email;
      }
    }

    // Anonymous users must provide an email (lead capture)
    if (!userId && (!userEmail || !userEmail.includes("@"))) {
      return NextResponse.json(
        { error: "Valid email is required for anonymous audits" },
        { status: 400 }
      );
    }

    const auditId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await saveAudit({
      id: auditId,
      url: normalizedUrl,
      email: userEmail || "anonymous@audit",
      status: "crawling",
      tier,
      result: null,
      createdAt,
    });

    try {
      const crawlResult = await crawlSite({
        url: normalizedUrl,
        tier: "pro", // crawl deep, gate at response level
        maxPages: 1, // single-page for now (paid multi-page coming via queue)
      });

      const gated = gateResultsByTier(crawlResult.issues, tier);

      const finalRecord: AuditRecord = {
        id: auditId,
        url: normalizedUrl,
        email: userEmail || "anonymous@audit",
        status: "complete",
        tier,
        result: {
          overallScore: crawlResult.overallScore,
          scores: crawlResult.scores,
          issues: gated.visibleResults,
          hiddenCount: gated.hiddenCount,
          lockedCategories: gated.lockedCategories,
          totalIssuesCount: gated.totalIssuesCount,
          metadata: crawlResult.metadata,
          pageData: crawlResult.pageData.map((p) => ({
            url: p.url,
            statusCode: p.statusCode,
            loadTimeMs: p.loadTimeMs,
            title: p.title,
            wordCount: p.wordCount,
          })),
          _allIssues: crawlResult.issues,
        },
        createdAt,
      };

      await saveAudit(finalRecord);
    } catch (crawlError) {
      console.error("Crawl error:", crawlError);
      await saveAudit({
        id: auditId,
        url: normalizedUrl,
        email: userEmail || "anonymous@audit",
        status: "failed",
        tier,
        result: {
          error: "Failed to crawl site. It may be unreachable or blocking our requests.",
        },
        createdAt,
      });
    }

    const final = await getAudit(auditId);

    // If this is a form post from the dashboard, redirect to the report page
    if (contentType.includes("application/x-www-form-urlencoded")) {
      return NextResponse.redirect(
        new URL(`/report/${auditId}`, request.url),
        { status: 303 }
      );
    }

    return NextResponse.json({
      auditId,
      status: final?.status || "complete",
      tier,
    });
  } catch (error) {
    console.error("Audit quick route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
