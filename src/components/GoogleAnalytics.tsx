"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GA_MEASUREMENT_ID, analyticsPath } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// The same stub as Google's own snippet: calls made before gtag.js has loaded
// queue on dataLayer and are replayed when it does. The initial config does
// NOT send a page view — this app is client-routed, so page views are sent by
// hand below, one per route, with the dynamic parts of the path taken out.
function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      // gtag.js needs the `arguments` object itself, not an array copy of it.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
  }
}

/**
 * Reports page views to the shared GA4 property.
 *
 * `enabled` is decided on the server (production deployments only), so preview
 * deployments and local development never add traffic to the real property.
 * Because the tag is part of the server-rendered document, it is also visible
 * to `npm run check:subdomains` in the marketing repo.
 */
export function GoogleAnalytics({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;
    const path = analyticsPath(pathname);
    if (path === null) return;
    ensureGtag();
    window.gtag!("event", "page_view", {
      page_path: path,
      page_location: window.location.origin + path,
    });
  }, [enabled, pathname]);

  if (!enabled) return null;
  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
  );
}
