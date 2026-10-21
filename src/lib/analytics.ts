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
