import type { FetchResult } from "@/lib/crawler/fetcher";
import type { ParsedPage } from "@/lib/crawler/parser";
import type { CheckResult } from "@/lib/scoring";

export function runPerformanceChecks(
  fetch: FetchResult,
  parsed: ParsedPage
): CheckResult[] {
  const results: CheckResult[] = [];

  // ─── Response Time (TTFB proxy) ─────────────────────────────────────────
  if (fetch.responseTimeMs > 3000) {
    results.push({
      checkId: "perf-ttfb-critical",
      category: "performance",
      severity: "critical",
      title: "Extremely slow server response time",
      description: `Server took ${fetch.responseTimeMs}ms to respond. Google recommends under 800ms.`,
      suggestion: "Consider upgrading hosting, enabling CDN, or optimizing server-side code.",
      fixGuide: `## Fix: Reduce Server Response Time\n\n1. **Enable a CDN** (Cloudflare, Vercel Edge)\n2. **Optimize database queries** — add indexes, reduce N+1 queries\n3. **Enable server-side caching** (Redis, Varnish)\n4. **Upgrade hosting** — move from shared to VPS/dedicated\n\n\`\`\`nginx\n# Enable gzip in Nginx\ngzip on;\ngzip_types text/plain text/css application/json application/javascript;\n\`\`\``,
      revenueImpact: "Every 1s delay reduces conversions by 7%. At current traffic, this could cost 15-30% of leads.",
      pageUrl: fetch.url,
    });
  } else if (fetch.responseTimeMs > 1500) {
    results.push({
      checkId: "perf-ttfb-warning",
      category: "performance",
      severity: "warning",
      title: "Slow server response time",
      description: `Server responded in ${fetch.responseTimeMs}ms. Target is under 800ms.`,
      suggestion: "Enable CDN and server-side caching to improve response time.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "perf-ttfb-pass",
      category: "performance",
      severity: "passed",
      title: "Good server response time",
      description: `Server responded in ${fetch.responseTimeMs}ms.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Page Size ──────────────────────────────────────────────────────────
  const pageSizeKB = Math.round(fetch.contentSize / 1024);
  if (pageSizeKB > 3000) {
    results.push({
      checkId: "perf-pagesize-critical",
      category: "performance",
      severity: "critical",
      title: "Page is extremely large",
      description: `HTML is ${pageSizeKB}KB. Large pages load slowly on mobile networks.`,
      suggestion: "Minify HTML, remove unused code, lazy-load below-fold content.",
      fixGuide: `## Fix: Reduce Page Size\n\n1. **Minify HTML** — remove comments and whitespace\n2. **Remove inline styles** — move to external CSS\n3. **Lazy-load below-fold content**\n4. **Compress with Brotli/Gzip**\n\n\`\`\`html\n<!-- Add loading="lazy" to images -->\n<img src="photo.jpg" loading="lazy" alt="..." />\n\`\`\``,
      pageUrl: fetch.url,
    });
  } else if (pageSizeKB > 1500) {
    results.push({
      checkId: "perf-pagesize-warning",
      category: "performance",
      severity: "warning",
      title: "Page size is above average",
      description: `HTML is ${pageSizeKB}KB. Consider reducing for faster load times.`,
      suggestion: "Minify HTML and consider code splitting.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "perf-pagesize-pass",
      category: "performance",
      severity: "passed",
      title: "Page size is acceptable",
      description: `HTML is ${pageSizeKB}KB.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Render-blocking Resources ──────────────────────────────────────────
  const blockingScripts = parsed.scripts.filter(
    (s) => s.src && !s.async && !s.defer
  );
  if (blockingScripts.length > 3) {
    results.push({
      checkId: "perf-render-blocking-critical",
      category: "performance",
      severity: "critical",
      title: `${blockingScripts.length} render-blocking scripts found`,
      description: "These scripts block page rendering until they finish loading.",
      suggestion: "Add async or defer attributes to non-critical scripts.",
      fixGuide: `## Fix: Remove Render-Blocking Scripts\n\nAdd \`defer\` to scripts that don't need to run immediately:\n\n\`\`\`html\n<!-- Before (blocking) -->\n<script src="analytics.js"></script>\n\n<!-- After (non-blocking) -->\n<script src="analytics.js" defer></script>\n\`\`\`\n\nFor critical scripts, use \`async\` if they don't depend on DOM:\n\`\`\`html\n<script src="critical.js" async></script>\n\`\`\``,
      pageUrl: fetch.url,
      rawData: { scripts: blockingScripts.map((s) => s.src) },
    });
  } else if (blockingScripts.length > 0) {
    results.push({
      checkId: "perf-render-blocking-warning",
      category: "performance",
      severity: "warning",
      title: `${blockingScripts.length} render-blocking script(s) detected`,
      description: "Consider deferring non-critical scripts.",
      suggestion: "Add defer or async attributes where possible.",
      pageUrl: fetch.url,
    });
  }

  // ─── Image Optimization ─────────────────────────────────────────────────
  const imagesWithoutLazy = parsed.images.filter(
    (img) => img.loading !== "lazy" && img.src
  );
  if (imagesWithoutLazy.length > 5) {
    results.push({
      checkId: "perf-lazy-loading-warning",
      category: "performance",
      severity: "warning",
      title: `${imagesWithoutLazy.length} images without lazy loading`,
      description: "Images below the fold should use loading='lazy' to defer loading.",
      suggestion: "Add loading='lazy' to images that aren't visible on initial page load.",
      fixGuide: `## Fix: Enable Lazy Loading\n\n\`\`\`html\n<!-- Add lazy loading to below-fold images -->\n<img src="photo.jpg" loading="lazy" alt="Description" width="800" height="600" />\n\`\`\`\n\nKeep the hero/above-fold image without lazy loading for LCP.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Images without dimensions ──────────────────────────────────────────
  if (parsed.imagesWithoutDimensions > 3) {
    results.push({
      checkId: "perf-img-dimensions",
      category: "performance",
      severity: "warning",
      title: `${parsed.imagesWithoutDimensions} images missing width/height`,
      description: "Missing dimensions cause layout shifts (CLS) as images load.",
      suggestion: "Add explicit width and height attributes to all images.",
      pageUrl: fetch.url,
    });
  }

  // ─── Inline Scripts/Styles ──────────────────────────────────────────────
  if (parsed.inlineScriptCount > 5) {
    results.push({
      checkId: "perf-inline-scripts",
      category: "performance",
      severity: "info",
      title: `${parsed.inlineScriptCount} inline scripts detected`,
      description: "Inline scripts can't be cached by the browser. Consider moving to external files.",
      suggestion: "Move inline scripts to external files for better caching.",
      pageUrl: fetch.url,
    });
  }

  // ─── Compression ────────────────────────────────────────────────────────
  const encoding = fetch.headers["content-encoding"] || "";
  if (!encoding.includes("gzip") && !encoding.includes("br")) {
    results.push({
      checkId: "perf-compression-missing",
      category: "performance",
      severity: "warning",
      title: "No compression detected (gzip/brotli)",
      description: "Compression can reduce transfer size by 60-80%.",
      suggestion: "Enable gzip or brotli compression on your server.",
      fixGuide: `## Fix: Enable Compression\n\n### Nginx:\n\`\`\`nginx\ngzip on;\ngzip_vary on;\ngzip_min_length 1024;\ngzip_types text/plain text/css application/json application/javascript text/xml;\n\`\`\`\n\n### Apache (.htaccess):\n\`\`\`apache\n<IfModule mod_deflate.c>\n  AddOutputFilterByType DEFLATE text/html text/css application/javascript\n</IfModule>\n\`\`\`\n\n### Vercel/Netlify: Compression is automatic.`,
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "perf-compression-pass",
      category: "performance",
      severity: "passed",
      title: "Compression enabled",
      description: `Using ${encoding} compression.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Cache Headers ──────────────────────────────────────────────────────
  const cacheControl = fetch.headers["cache-control"] || "";
  if (!cacheControl && !fetch.headers["expires"]) {
    results.push({
      checkId: "perf-cache-missing",
      category: "performance",
      severity: "warning",
      title: "No cache headers set",
      description: "Browser caching reduces repeat-visit load times significantly.",
      suggestion: "Set Cache-Control headers for static assets.",
      pageUrl: fetch.url,
    });
  }

  return results;
}
