/**
 * Admin gating — comma-separated email allowlist via ADMIN_EMAILS env var.
 *
 * Example: ADMIN_EMAILS="hanish@acquihiretech.com,founder@gmail.com"
 */

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  return admins.includes(email.toLowerCase());
}
