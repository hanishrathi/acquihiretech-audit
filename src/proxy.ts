import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy middleware (Next.js 16 convention — replaces middleware.ts).
 *
 * Clerk is loaded ONLY when its env vars are present. Without them, this
 * file is a transparent passthrough so the free audit tool keeps working
 * before auth/payments are configured. This prevents a missing env var
 * from taking down the entire site (which is exactly what happened).
 */

const clerkConfigured = Boolean(
  process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

async function buildHandler() {
  if (!clerkConfigured) {
    // Passthrough — no auth enforcement
    return function passthrough(_req: NextRequest) {
      return NextResponse.next();
    };
  }

  // Clerk is configured — load it dynamically so the import never runs
  // (and never throws) when keys are absent.
  const { clerkMiddleware, createRouteMatcher } = await import(
    "@clerk/nextjs/server"
  );

  const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/api/projects(.*)",
    "/api/monitors(.*)",
  ]);

  return clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  });
}

const handlerPromise = buildHandler();

export default async function proxy(req: NextRequest, event: any) {
  const handler = await handlerPromise;
  return (handler as any)(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/(.*)",
    "/(api|trpc)(.*)",
  ],
};
