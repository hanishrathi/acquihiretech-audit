import { NextResponse } from "next/server";
import { crawlSite } from "@/lib/crawler";
import { gateResultsByTier } from "@/lib/tier-gate";

// In-memory store for MVP (replace with Supabase in production)
const auditStore = new Map<
  string,
  {
    id: string;
    url: string;
    email: string;
    status: string;
    tier: string;
    result: any;
    createdAt: string;
  }
>();

// Export the store so the status/result routes can access it
export { auditStore };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, email } = body;

    // Validate inputs
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
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

    // Validate URL format
    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Generate audit ID
    const auditId = crypto.randomUUID();

    // Store initial audit record
    auditStore.set(auditId, {
      id: auditId,
      url: normalizedUrl,
      email,
      status: "crawling",
      tier: "basic",
      result: null,
      createdAt: new Date().toISOString(),
    });

    // Run crawl (for MVP, synchronous; later move to BullMQ)
    try {
      const crawlResult = await crawlSite({
        url: normalizedUrl,
        tier: "pro", // Crawl everything, gate at response level
        maxPages: 1,
      });

      // Gate results for free tier
      const gated = gateResultsByTier(crawlResult.issues, "basic");

      // Update store with results
      auditStore.set(auditId, {
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
        },
        createdAt: new Date().toISOString(),
      });
    } catch (crawlError) {
      auditStore.set(auditId, {
        id: auditId,
        url: normalizedUrl,
        email,
        status: "failed",
        tier: "basic",
        result: { error: "Failed to crawl site. It may be unreachable or blocking our requests." },
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      auditId,
      status: auditStore.get(auditId)?.status,
    });
  } catch (error) {
    console.error("Audit quick route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
