import { sendEmail } from "./smtp";
import { getProductBySlug, formatProductPrice } from "@/lib/products";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://audit.acquihiretech.com";

/**
 * Send a customer the download link for a paid product after admin
 * approves the payment.
 */
export async function sendProductDownloadEmail(payment: any): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!payment.product_slug || !payment.user_email) {
    return { ok: false, error: "Not a product order or missing email" };
  }

  const product = getProductBySlug(payment.product_slug);
  if (!product) {
    return { ok: false, error: `Unknown product slug: ${payment.product_slug}` };
  }

  const subject = `Your download: ${product.title}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto; color:#1d1d1f; padding:24px">
      <h2 style="font-weight:600; letter-spacing:-0.015em; margin:0 0 12px">
        Payment verified — here&apos;s your download
      </h2>
      <p style="color:#86868b; margin:0 0 24px; font-size:15px">
        Thanks for your purchase. Your download link is ready below.
      </p>

      <div style="background:#f5f5f7; border-radius:12px; padding:20px; margin-bottom:24px">
        <div style="font-size:13px; color:#86868b; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:6px">
          Your purchase
        </div>
        <div style="font-size:18px; font-weight:600; margin-bottom:4px">
          ${product.title}
        </div>
        <div style="font-size:14px; color:#86868b">
          ${formatProductPrice(product.priceINR)} · ${product.fileFormat} · ${product.fileSize}
        </div>
      </div>

      <a href="${product.fileUrl}"
         style="display:inline-block; padding:14px 28px; background:#1d1d1f; color:#fff;
                text-decoration:none; border-radius:980px; font-weight:500; font-size:16px">
        Download now →
      </a>

      <p style="color:#86868b; font-size:13px; margin-top:24px">
        Or copy this link:
        <br>
        <a href="${product.fileUrl}" style="color:#0066cc; word-break:break-all">${product.fileUrl}</a>
      </p>

      <div style="margin-top:32px; padding-top:24px; border-top:1px solid #e8e8ed; font-size:13px; color:#86868b; line-height:1.6">
        <strong style="color:#1d1d1f">License:</strong> Commercial use permitted.<br>
        <strong style="color:#1d1d1f">Receipt:</strong> Order ID <code>${payment.id}</code><br>
        <strong style="color:#1d1d1f">Support:</strong> Reply to this email or contact
        <a href="mailto:crypto@acquihiretech.com" style="color:#0066cc">crypto@acquihiretech.com</a>
      </div>

      <p style="color:#a1a1a6; font-size:12px; margin-top:32px">
        AcquihireTech · ${baseUrl}/shop
      </p>
    </div>
  `;
  const text = `Payment verified — here's your download

Your purchase: ${product.title}
Price: ${formatProductPrice(product.priceINR)}
Format: ${product.fileFormat} (${product.fileSize})

Download: ${product.fileUrl}

License: Commercial use permitted.
Order ID: ${payment.id}
Support: crypto@acquihiretech.com

— AcquihireTech`;

  return sendEmail({
    to: payment.user_email,
    subject,
    html,
    text,
  });
}
