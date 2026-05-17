// ─── HTTP Fetcher using Undici (fast, lightweight) ──────────────────────────

export interface FetchResult {
  url: string;
  finalUrl: string; // after redirects
  statusCode: number;
  headers: Record<string, string>;
  html: string;
  responseTimeMs: number;
  contentSize: number; // bytes
  redirectChain: string[];
  isHttps: boolean;
  serverHeader: string;
  contentType: string;
  protocol: string;
}

export async function fetchPage(url: string): Promise<FetchResult> {
  const startTime = Date.now();
  const redirectChain: string[] = [];

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "AcquiHireBot/1.0 (+https://acquihiretech.com/bot) Mozilla/5.0 (compatible)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    const responseTimeMs = Date.now() - startTime;
    const html = await response.text();
    const contentSize = new TextEncoder().encode(html).length;

    // Extract headers as plain object
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Track if there were redirects
    if (response.redirected) {
      redirectChain.push(url);
      redirectChain.push(response.url);
    }

    return {
      url,
      finalUrl: response.url,
      statusCode: response.status,
      headers,
      html,
      responseTimeMs,
      contentSize,
      redirectChain,
      isHttps: response.url.startsWith("https://"),
      serverHeader: headers["server"] || "",
      contentType: headers["content-type"] || "",
      protocol: response.url.startsWith("https://") ? "h2" : "http/1.1",
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;

    // Return error state but don't throw — let checks handle it
    return {
      url,
      finalUrl: url,
      statusCode: 0,
      headers: {},
      html: "",
      responseTimeMs,
      contentSize: 0,
      redirectChain: [],
      isHttps: url.startsWith("https://"),
      serverHeader: "",
      contentType: "",
      protocol: "",
    };
  }
}

/**
 * Fetch robots.txt for a domain.
 */
export async function fetchRobotsTxt(
  domain: string
): Promise<string | null> {
  try {
    const response = await fetch(`https://${domain}/robots.txt`, {
      headers: {
        "User-Agent": "AcquiHireBot/1.0 (+https://acquihiretech.com/bot)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      return await response.text();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch sitemap.xml for a domain.
 */
export async function fetchSitemap(
  domain: string
): Promise<string | null> {
  try {
    const response = await fetch(`https://${domain}/sitemap.xml`, {
      headers: {
        "User-Agent": "AcquiHireBot/1.0 (+https://acquihiretech.com/bot)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      return await response.text();
    }
    return null;
  } catch {
    return null;
  }
}
