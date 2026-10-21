/**
 * Conversion events, sent to GA4 and the Meta Pixel.
 *
 * Both tags exist only on production deployments (and the pixel only once a
 * page allowed to load it has been visited), so these calls are no-ops in
 * previews and local development. Never put personal data in the params: no
 * email address, no URL the visitor typed, no names.
 */
type Params = Record<string, unknown>;

export function trackConversion(
  ga: { name: string; params?: Params },
  meta?: { name: string; params?: Params }
) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", ga.name, ga.params ?? {});
  if (meta) window.fbq?.("track", meta.name, meta.params ?? {});
}
