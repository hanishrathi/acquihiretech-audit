import type { FetchResult } from "@/lib/crawler/fetcher";
import type { ParsedPage } from "@/lib/crawler/parser";
import type { CheckResult } from "@/lib/scoring";

export function runSecurityChecks(
  fetch: FetchResult,
  parsed: ParsedPage
): CheckResult[] {
  const results: CheckResult[] = [];

  // ─── HTTPS ──────────────────────────────────────────────────────────────
  if (!fetch.isHttps) {
    results.push({
      checkId: "sec-https-missing",
      category: "security",
      severity: "critical",
      title: "Site not using HTTPS",
      description: "The site is served over HTTP. Data is transmitted unencrypted.",
      suggestion: "Install an SSL certificate and redirect all HTTP traffic to HTTPS.",
      fixGuide: `## Fix: Enable HTTPS\n\n1. Get a free SSL certificate from Let's Encrypt\n2. Configure your server:\n\n\`\`\`nginx\nserver {\n  listen 80;\n  server_name yourdomain.com;\n  return 301 https://$host$request_uri;\n}\n\nserver {\n  listen 443 ssl;\n  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;\n  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;\n}\n\`\`\`\n\nMost modern hosts (Vercel, Netlify, Cloudflare) provide free automatic HTTPS.`,
      revenueImpact: "Chrome marks HTTP sites as 'Not Secure'. This alone can reduce conversions by 20%+.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "sec-https-pass",
      category: "security",
      severity: "passed",
      title: "HTTPS enabled",
      description: "Site is served over HTTPS with a valid certificate.",
      pageUrl: fetch.url,
    });
  }

  // ─── Security Headers ───────────────────────────────────────────────────
  const securityHeaders = {
    "strict-transport-security": {
      name: "HSTS (Strict-Transport-Security)",
      critical: true,
    },
    "x-content-type-options": {
      name: "X-Content-Type-Options",
      critical: false,
    },
    "x-frame-options": {
      name: "X-Frame-Options",
      critical: false,
    },
    "content-security-policy": {
      name: "Content-Security-Policy",
      critical: false,
    },
    "referrer-policy": {
      name: "Referrer-Policy",
      critical: false,
    },
    "permissions-policy": {
      name: "Permissions-Policy",
      critical: false,
    },
  };

  let missingCriticalHeaders = 0;
  let missingHeaders = 0;
  const missingHeaderNames: string[] = [];

  for (const [header, meta] of Object.entries(securityHeaders)) {
    if (!fetch.headers[header]) {
      if (meta.critical) missingCriticalHeaders++;
      missingHeaders++;
      missingHeaderNames.push(meta.name);
    }
  }

  if (missingCriticalHeaders > 0) {
    results.push({
      checkId: "sec-headers-critical",
      category: "security",
      severity: "critical",
      title: "Critical security headers missing",
      description: `Missing HSTS header. Without it, browsers won't enforce HTTPS.`,
      suggestion: "Add Strict-Transport-Security header with a long max-age.",
      fixGuide: `## Fix: Add Security Headers\n\n### Nginx:\n\`\`\`nginx\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header X-Frame-Options "SAMEORIGIN" always;\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\`\`\`\n\n### Vercel (vercel.json):\n\`\`\`json\n{\n  "headers": [{\n    "source": "/(.*)",\n    "headers": [\n      { "key": "Strict-Transport-Security", "value": "max-age=31536000" },\n      { "key": "X-Content-Type-Options", "value": "nosniff" },\n      { "key": "X-Frame-Options", "value": "SAMEORIGIN" }\n    ]\n  }]\n}\n\`\`\``,
      pageUrl: fetch.url,
    });
  }

  if (missingHeaders > 2) {
    results.push({
      checkId: "sec-headers-warning",
      category: "security",
      severity: "warning",
      title: `${missingHeaders} security headers missing`,
      description: `Missing: ${missingHeaderNames.join(", ")}`,
      suggestion: "Add recommended security headers to protect against common attacks.",
      pageUrl: fetch.url,
    });
  }

  // ─── Mixed Content ──────────────────────────────────────────────────────
  if (fetch.isHttps) {
    const httpResources = fetch.html.match(/http:\/\/(?!localhost)/g);
    if (httpResources && httpResources.length > 0) {
      results.push({
        checkId: "sec-mixed-content",
        category: "security",
        severity: "warning",
        title: "Mixed content detected",
        description: `Found ${httpResources.length} HTTP resource(s) on an HTTPS page. Browsers may block these.`,
        suggestion: "Replace all http:// references with https:// or protocol-relative URLs.",
        pageUrl: fetch.url,
      });
    }
  }

  // ─── Server Information Disclosure ──────────────────────────────────────
  if (fetch.serverHeader && fetch.serverHeader.includes("/")) {
    results.push({
      checkId: "sec-server-disclosure",
      category: "security",
      severity: "info",
      title: "Server version disclosed in headers",
      description: `Server header reveals: "${fetch.serverHeader}". This helps attackers target known vulnerabilities.`,
      suggestion: "Remove or obfuscate the Server header version information.",
      pageUrl: fetch.url,
    });
  }

  // ─── External Scripts ───────────────────────────────────────────────────
  const externalScripts = parsed.scripts.filter(
    (s) => s.src && !s.src.startsWith("/") && !s.src.includes(new URL(fetch.url).hostname)
  );
  if (externalScripts.length > 5) {
    results.push({
      checkId: "sec-external-scripts",
      category: "security",
      severity: "info",
      title: `${externalScripts.length} external scripts loaded`,
      description: "Each external script is a potential security risk. Ensure you trust all sources.",
      suggestion: "Consider using Subresource Integrity (SRI) for external scripts, and audit third-party scripts regularly.",
      pageUrl: fetch.url,
    });
  }

  // ─── Sensitive Information in HTML ──────────────────────────────────────
  const sensitivePatterns = [
    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
    /secret[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
    /password\s*[:=]\s*['"][^'"]+['"]/i,
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(fetch.html)) {
      results.push({
        checkId: "sec-sensitive-data",
        category: "security",
        severity: "critical",
        title: "Possible sensitive data exposed in HTML",
        description: "Found patterns resembling API keys or credentials in the page source.",
        suggestion: "Move sensitive data to server-side environment variables. Never expose secrets in client-side code.",
        pageUrl: fetch.url,
      });
      break;
    }
  }

  return results;
}
