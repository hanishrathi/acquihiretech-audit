import Razorpay from "razorpay";
import crypto from "crypto";
import { PLANS, type PlanId } from "./plans";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayClient: Razorpay | null = null;
if (keyId && keySecret) {
  razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function isRazorpayConfigured(): boolean {
  return Boolean(razorpayClient);
}

export async function createRazorpayOrder(planId: PlanId, userId: string) {
  if (!razorpayClient) throw new Error("Razorpay not configured");

  const plan = PLANS[planId];
  const order = await razorpayClient.orders.create({
    amount: plan.pricesINR, // in paise
    currency: "INR",
    receipt: `${userId.slice(0, 8)}-${planId}-${Date.now()}`,
    notes: {
      plan_id: planId,
      user_id: userId,
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: keyId!,
  };
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!keySecret) return false;

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
}

export function verifyRazorpayWebhook(body: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return expected === signature;
}
