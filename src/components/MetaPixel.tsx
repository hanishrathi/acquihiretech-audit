"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { META_PIXEL_ID, metaPixelAllowed } from "@/lib/analytics";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: unknown;
  loaded: boolean;
  version: string;
  disablePushState?: boolean;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

// Meta's base code, unminified: calls queue until fbevents.js loads.
// - autoConfig off: no automatic button-click or page-metadata scraping (the
//   audit form takes an email address).
// - disablePushState: the pixel does not send its own page view on client-side
//   navigation; page views are sent below, only for pages that may report.
// Loaded lazily, on the first page that is allowed to report, so a visit that
// lands on a report or checkout page never loads it at all.
function ensureFbq(): Fbq {
  if (window.fbq) return window.fbq;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  fbq.disablePushState = true;
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);

  fbq("set", "autoConfig", false, META_PIXEL_ID);
  fbq("init", META_PIXEL_ID);
  return fbq;
}

/**
 * Meta Pixel page views, production deployments only (same `enabled` as
 * GoogleAnalytics). Only public, ID-free pages report — see metaPixelAllowed.
 */
export function MetaPixel({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;
    if (!metaPixelAllowed(pathname, window.location.search)) return;
    ensureFbq()("track", "PageView");
  }, [enabled, pathname]);

  return null;
}
