/**
 * SMTP email client — uses any standard SMTP server (cPanel mail,
 * Gmail, Google Workspace, etc.). No third-party signup required.
 *
 * Required env vars:
 *   SMTP_HOST   e.g. mail.acquihiretech.com
 *   SMTP_PORT   465 (SSL) or 587 (STARTTLS)
 *   SMTP_USER   full email, e.g. crypto@acquihiretech.com
 *   SMTP_PASS   the mailbox password
 *
 * Optional:
 *   SMTP_FROM   defaults to SMTP_USER
 */

import nodemailer, { type Transporter } from "nodemailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: { user, pass },
  });
  return transporter;
}

let lastSmtpError: string | null = null;
export function getLastSmtpError() {
  return lastSmtpError;
}

export function isSmtpConfigured(): boolean {
  return Boolean(host && user && pass);
}

const FROM_EMAIL =
  process.env.SMTP_FROM || (user ? `AcquiHire Audit <${user}>` : "");

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const t = getTransporter();
  if (!t) {
    const msg = "SMTP not configured (SMTP_HOST/USER/PASS missing)";
    lastSmtpError = msg;
    console.log(`[email] SKIPPED: "${opts.subject}" -> ${opts.to}`);
    return { ok: false, error: msg };
  }

  try {
    const info = await t.sendMail({
      from: FROM_EMAIL,
      to: Array.isArray(opts.to) ? opts.to.join(", ") : opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    lastSmtpError = null;
    return { ok: true, id: info.messageId };
  } catch (err: any) {
    const msg = err?.message || String(err);
    lastSmtpError = msg;
    console.error("[email] SMTP send error:", err);
    return { ok: false, error: msg };
  }
}
