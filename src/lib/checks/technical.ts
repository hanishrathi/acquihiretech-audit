import type { FetchResult } from "@/lib/crawler/fetcher";
import type { ParsedPage } from "@/lib/crawler/parser";
import type { CheckResult } from "@/lib/scoring";

export function runTechnicalChecks(
  fetch: FetchResult,
  parsed: ParsedPage
): CheckResult[] {
  const results: CheckResult[] = [];

  // ─── HTTP Status Code ───────────────────────────────────────────────────
  if (fetch.statusCode === 0) {
    results.push({
      checkId: "tech-unreachable",
      category: "technical",
      severity: "critical",
      title: "Site is unreachable",
      description: "Could not connect to the server. The site may be down or blocking requests.",
      suggestion: "Verify the URL is correct and the server is running.",
      pageUrl: fetch.url,
    });
  } else if (fetch.statusCode >= 500) {
    results.push({
      checkId: "tech-server-error",
      category: "technical",
      severity: "critical",
      title: `Server error (HTTP ${fetch.statusCode})`,
      description: "The server returned an error response. This indicates a server-side problem.",
      suggestion: "Check server logs for errors. Common causes: misconfigured routing, database connection issues, or application crashes.",
      pageUrl: fetch.url,
    });
  } else if (fetch.statusCode >= 400) {
    results.push({
      checkId: "tech-client-error",
      category: "technical",
      severity: "critical",
      title: `Client error (HTTP ${fetch.statusCode})`,
      description: `The server returned a ${fetch.statusCode} status. The page may not exist or access is denied.`,
      suggestion: "Check if the URL is correct. If this is intentional, ensure proper redirects are in place.",
      pageUrl: fetch.url,
    });
  } else if (fetch.statusCode === 200) {
    results.push({
      checkId: "tech-status-pass",
      category: "technical",
      severity: "passed",
      title: "Page returns HTTP 200",
      description: "Server responded successfully.",
      pageUrl: fetch.url,
    });
  }

  // ─── Redirect Chain ─────────────────────────────────────────────────────
  if (fetch.redirectChain.length > 2) {
    results.push({
      checkId: "tech-redirect-chain",
      category: "technical",
      severity: "warning",
      title: `Redirect chain detected (${fetch.redirectChain.length} hops)`,
      description: "Multiple redirects slow down page load and waste crawl budget.",
      suggestion: "Reduce redirect chains to a single hop. Update links to point directly to the final URL.",
      fixGuide: `## Fix: Reduce Redirect Chains\n\n**Current chain:**\n${fetch.redirectChain.map((url, i) => `${i + 1}. ${url}`).join("\n")}\n\n**Solution:** Update all links and references to point directly to the final URL: \`${fetch.finalUrl}\``,
      pageUrl: fetch.url,
    });
  }

  // ─── Broken Internal Links (candidates) ─────────────────────────────────
  if (parsed.brokenLinkCandidates.length > 0) {
    results.push({
      checkId: "tech-broken-links",
      category: "technical",
      severity: "warning",
      title: `${parsed.brokenLinkCandidates.length} potentially broken link(s)`,
      description: "Found links with invalid or malformed URLs.",
      suggestion: "Review and fix all broken links. Broken links hurt SEO and user experience.",
      pageUrl: fetch.url,
      rawData: { links: parsed.brokenLinkCandidates.slice(0, 10) },
    });
  }

  // ─── DNS & Server Response ──────────────────────────────────────────────
  if (fetch.responseTimeMs > 5000) {
    results.push({
      checkId: "tech-dns-slow",
      category: "technical",
      severity: "warning",
      title: "Very slow initial connection",
      description: `Total response time of ${fetch.responseTimeMs}ms suggests DNS or connection issues.`,
      suggestion: "Consider using a CDN (Cloudflare) to improve DNS resolution and connection times globally.",
      pageUrl: fetch.url,
    });
  }

  // ─── Compression ────────────────────────────────────────────────────────
  const contentEncoding = fetch.headers["content-encoding"];
  if (!contentEncoding) {
    results.push({
      checkId: "tech-no-compression",
      category: "technical",
      severity: "warning",
      title: "Response not compressed",
      description: "The server response is not using gzip or brotli compression.",
      suggestion: "Enable gzip/brotli compression to reduce transfer sizes by 60-80%.",
      pageUrl: fetch.url,
    });
  }

  // ─── HTML Validity (basic checks) ──────────────────────────────────────
  if (!parsed.charset) {
    results.push({
      checkId: "tech-charset-missing",
      category: "technical",
      severity: "info",
      title: "Character encoding not declared",
      description: "Missing charset declaration may cause rendering issues with special characters.",
      suggestion: 'Add <meta charset="UTF-8" /> early in the <head> section.',
      pageUrl: fetch.url,
    });
  }

  // ─── Favicon ────────────────────────────────────────────────────────────
  if (!parsed.hasFavicon) {
    results.push({
      checkId: "tech-favicon-missing",
      category: "technical",
      severity: "info",
      title: "Missing favicon",
      description: "A favicon helps users identify your site in browser tabs and bookmarks.",
      suggestion: "Add a favicon link in the <head> section.",
      pageUrl: fetch.url,
    });
  }

  // ─── HTML Size Check ────────────────────────────────────────────────────
  const htmlSizeKB = Math.round(parsed.htmlSize / 1024);
  if (htmlSizeKB > 500) {
    results.push({
      checkId: "tech-html-bloated",
      category: "technical",
      severity: "warning",
      title: `Large HTML document (${htmlSizeKB}KB)`,
      description: "HTML documents over 500KB take longer to parse and may indicate bloated markup.",
      suggestion: "Minify HTML, remove unnecessary comments, and move inline styles/scripts to external files.",
      pageUrl: fetch.url,
    });
  }

  // ─── Service Worker ─────────────────────────────────────────────────────
  if (parsed.hasServiceWorker) {
    results.push({
      checkId: "tech-service-worker",
      category: "technical",
      severity: "passed",
      title: "Service worker detected",
      description: "Service workers enable offline support and faster repeat visits.",
      pageUrl: fetch.url,
    });
  }

  return results;
}
