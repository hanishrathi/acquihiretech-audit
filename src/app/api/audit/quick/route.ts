import { NextResponse } from "next/server";
import { crawlSite } from "@/lib/crawler";
import { gateResultsByTier } from "@/lib/tier-gate";
import { saveAudit, getAudit, type AuditRecord } from "@/lib/db/audit-store";

// Re-export for legacy compatibility (old code imported `auditStore`)
export { getAudit, saveAudit };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, email } = body;

    // Validate inputs
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Normalize URL
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
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const auditId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Save initial "crawling" record
    await saveAudit({
      id: auditId,
      url: normalizedUrl,
      email,
      status: "crawling",
      tier: "basic",
      result: null,
      createdAt,
    });

    // Run crawl synchronously (will move to BullMQ for paid tiers)
    try {
      const crawlResult = await crawlSite({
        url: normalizedUrl,
        tier: "pro", // Always crawl deep, gate at response level
        maxPages: 1,
      });

      const gated = gateResultsByTier(crawlResult.issues, "basic");

      const finalRecord: AuditRecord = {
        id: auditId,
        url: normalizedUrl,
        email,
        status: "complete",
        tier: "basic",
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
          // Note: we store unfiltered issues internally for upgrade-to-paid reveal
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
        email,
        status: "failed",
        tier: "basic",
        result: {
          error:
            "Failed to crawl site. It may be unreachable or blocking our requests.",
        },
        createdAt,
      });
    }

    const final = await getAudit(auditId);
    return NextResponse.json({
      auditId,
      status: final?.status || "complete",
    });
  } catch (error) {
    console.error("Audit quick route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
