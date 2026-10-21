/**
 * Google Analytics 4 — shared with acquihiretech.com and its other subdomains.
 *
 * One property for the whole domain: this is the Measurement ID in the
 * marketing site's js/analytics.js. gtag's default cookie domain ('auto')
 * writes _ga on .acquihiretech.com, so a visitor who goes marketing site ->
 * audit.acquihiretech.com stays one user in one session. Do not set a
 * cookie_domain or add a cross-domain linker for it: either would split them.
 * Which subdomain a hit came from is GA4's built-in Hostname dimension.
 *
 * (The marketing repo's `npm run check:subdomains` fails if this drifts.)
 */
export const GA_MEASUREMENT_ID = "G-XGCN7KZKVK";

/** The marketing site's Meta Pixel (same ID as its js/analytics.js). */
export const META_PIXEL_ID = "1659929699486976";

/** Pages that are never reported: staff-only. */
const UNTRACKED = [/^\/admin(\/|$)/];

/**
 * Dynamic segments are replaced before a path leaves the browser. A report or
 * checkout ID is a capability — whoever has the URL can open that record — so
 * it has no business in a third party's logs. The route shape is what we want
 * to measure, not which record was opened.
 */
const DYNAMIC: Array<[RegExp, string]> = [
  [/^\/report\/[^/]+/, "/report/:id"],
  [/^\/checkout\/(crypto|upi)\/[^/]+/, "/checkout/$1/:id"],
];

/**
 * The path to report for a pathname, or null when the page is not reported.
 * Takes a pathname, never a full URL, so a query string or fragment cannot
 * reach this function in the first place.
 */
export function analyticsPath(pathname: string): string | null {
  if (UNTRACKED.some((re) => re.test(pathname))) return null;
  for (const [re, replacement] of DYNAMIC) {
    if (re.test(pathname)) return pathname.replace(re, replacement);
  }
  return pathname;
}

/**
 * The Meta Pixel always reports the full URL and offers no way to rewrite it,
 * so instead of cleaning the URL we only let it fire where the URL is clean:
 * the public, ID-free marketing pages, with nothing in the query string but
 * campaign parameters (and ?buy=1, which the marketing site's shop links add).
 */
const META_PAGES = [/^\/$/, /^\/pricing$/, /^\/shop$/, /^\/shop\/[a-z0-9-]+$/];
const SAFE_PARAM = /^(utm_[a-z]+|fbclid|gclid|buy)$/;

export function metaPixelAllowed(pathname: string, search: string): boolean {
  if (!META_PAGES.some((re) => re.test(pathname))) return false;
  return Array.from(new URLSearchParams(search).keys()).every((k) => SAFE_PARAM.test(k));
}
