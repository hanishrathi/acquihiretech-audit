import QRCode from "qrcode";

/**
 * Build a UPI deep-link URL per the NPCI spec.
 * Scanning it in any UPI app (GPay, PhonePe, Paytm, BHIM, etc.) opens
 * a pre-filled payment screen.
 */
export function buildUpiUrl(opts: {
  payeeId: string;
  payeeName: string;
  amountRupees: number;
  reference: string;
  note?: string;
}): string {
  const params = new URLSearchParams({
    pa: opts.payeeId,
    pn: opts.payeeName,
    am: opts.amountRupees.toFixed(2),
    cu: "INR",
    tn: opts.note || `AcquiHire Audit ${opts.reference}`,
    tr: opts.reference,
  });
  return `upi://pay?${params.toString()}`;
}

/** Render a UPI URL as a Data URL PNG QR (suitable for <img src="">). */
export async function upiQrDataUrl(upiUrl: string): Promise<string> {
  return QRCode.toDataURL(upiUrl, {
    margin: 1,
    width: 320,
    color: { dark: "#1d1d1f", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}

export function isUpiConfigured(): boolean {
  return Boolean(process.env.UPI_PAYEE_ID && process.env.UPI_PAYEE_NAME);
}

export function getUpiConfig() {
  return {
    payeeId: process.env.UPI_PAYEE_ID || "",
    payeeName: process.env.UPI_PAYEE_NAME || "",
  };
}

/** Short, human-readable reference like AH-1779Y3K2 */
export function generateUpiReference(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `AH${stamp}${rand}`;
}
