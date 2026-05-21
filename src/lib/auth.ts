/**
 * Safe auth wrappers.
 *
 * Clerk's auth() / currentUser() throw if Clerk isn't configured or
 * clerkMiddleware() didn't run. These wrappers degrade gracefully to
 * "anonymous" so the free audit tool keeps working before auth is set up.
 */

export const clerkConfigured = Boolean(
  process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export async function safeAuth(): Promise<{ userId: string | null }> {
  if (!clerkConfigured) return { userId: null };
  try {
    const { auth } = await import("@clerk/nextjs/server");
    return await auth();
  } catch {
    return { userId: null };
  }
}

export async function safeCurrentUser(): Promise<any | null> {
  if (!clerkConfigured) return null;
  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    return await currentUser();
  } catch {
    return null;
  }
}
