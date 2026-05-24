/**
 * Resend email client.
 * Best-effort — if RESEND_API_KEY isn't set, emails silently no-op
 * (logged to console) so payment flows keep working.
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
let client: Resend | null = null;
if (apiKey) client = new Resend(apiKey);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "AcquiHire Audit <noreply@acquihiretech.com>";

let lastResendError: string | null = null;
export function getLastResendError() {
  return lastResendError;
}

export function isResendConfigured() {
  return Boolean(client);
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!client) {
    lastResendError = "Resend not configured (RESEND_API_KEY missing)";
    console.log(`[email] SKIPPED (no API key): "${opts.subject}" -> ${opts.to}`);
    return { ok: false, error: lastResendError };
  }

  try {
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (result.error) {
      lastResendError = `${result.error.name || "Error"}: ${result.error.message}`;
      console.error("[email] Resend error:", result.error);
      return { ok: false, error: lastResendError };
    }
    lastResendError = null;
    return { ok: true, id: result.data?.id };
  } catch (err: any) {
    lastResendError = err.message || String(err);
    console.error("[email] send threw:", err);
    return { ok: false, error: lastResendError };
  }
}
