import { sendEmail } from "./smtp";
import { getAdminEmails } from "@/lib/admin";
import { CRYPTO_CHAINS, type CryptoChain } from "@/lib/payments/crypto";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://audit.acquihiretech.com";

/**
 * Send admins an email when a customer submits payment proof.
 * Recipients: NOTIFY_EMAIL if set, otherwise ALL admins from ADMIN_EMAILS.
 */
export async function notifyAdminsOfSubmission(payment: any) {
  const recipients = process.env.NOTIFY_EMAIL
    ? [process.env.NOTIFY_EMAIL]
    : getAdminEmails();

  if (recipients.length === 0) {
    console.log("[email] No admin recipients configured — skip notify");
    return;
  }

  const amount = (payment.amount_inr / 100).toLocaleString("en-IN");
  const method = payment.method === "upi" ? "UPI" : "Crypto";

  let methodDetails = "";
  if (payment.method === "upi") {
    methodDetails = `
      <p><strong>Reference:</strong> <code>${payment.upi_reference}</code></p>
      <p><strong>Customer-submitted UTR:</strong> <code>${payment.upi_utr}</code></p>
    `;
  } else if (payment.method === "crypto") {
    const cfg = CRYPTO_CHAINS[payment.crypto_chain as CryptoChain];
    const explorerLink = cfg ? cfg.explorerTx(payment.crypto_tx_hash) : "#";
    methodDetails = `
      <p><strong>Chain:</strong> ${cfg?.label || payment.crypto_chain}</p>
      <p><strong>Amount sent:</strong> ${payment.crypto_amount_native} ${cfg?.symbol || ""}</p>
      <p><strong>To address:</strong> <code style="word-break:break-all">${payment.crypto_address}</code></p>
      <p><strong>Transaction hash:</strong>
        <a href="${explorerLink}" style="color:#0066cc;word-break:break-all">${payment.crypto_tx_hash}</a>
      </p>
    `;
  }

  const subject = `New ${method} payment from ${payment.user_email} — ₹${amount} ${payment.plan_id} plan`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto; color:#1d1d1f; padding:24px">
      <h2 style="font-weight:600; letter-spacing:-0.015em; margin:0 0 16px">
        🔔 New payment submitted
      </h2>
      <p style="color:#86868b; margin:0 0 24px">A customer just submitted payment proof. Review in your admin dashboard:</p>

      <div style="background:#f5f5f7; border-radius:12px; padding:20px; margin-bottom:24px">
        <p style="margin:0 0 8px"><strong>Customer:</strong> ${payment.user_email}</p>
        <p style="margin:0 0 8px"><strong>Plan:</strong> ${payment.plan_id} (₹${amount}/mo)</p>
        <p style="margin:0 0 8px"><strong>Method:</strong> ${method}</p>
        ${methodDetails}
        <p style="margin:0; color:#86868b; font-size:13px"><strong>Payment ID:</strong> <code>${payment.id}</code></p>
      </div>

      <a href="${baseUrl}/admin/payments"
         style="display:inline-block; padding:12px 24px; background:#1d1d1f; color:#fff;
                text-decoration:none; border-radius:980px; font-weight:500">
        Review in admin dashboard →
      </a>

      <p style="color:#86868b; font-size:13px; margin-top:32px">
        AcquiHire Audit · automated notification
      </p>
    </div>
  `;
  const text = `New ${method} payment submitted

Customer: ${payment.user_email}
Plan: ${payment.plan_id} (₹${amount}/mo)
${
  payment.method === "upi"
    ? `Reference: ${payment.upi_reference}\nUTR: ${payment.upi_utr}`
    : `Chain: ${payment.crypto_chain}\nAmount: ${payment.crypto_amount_native}\nTx: ${payment.crypto_tx_hash}`
}

Review: ${baseUrl}/admin/payments`;

  await sendEmail({ to: recipients, subject, html, text });
}
