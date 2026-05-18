import Stripe from "stripe";
import { PLANS, type PlanId } from "./plans";

const secretKey = process.env.STRIPE_SECRET_KEY;
let stripeClient: Stripe | null = null;
if (secretKey) {
  stripeClient = new Stripe(secretKey, { apiVersion: "2024-12-18.acacia" as any });
}

export function isStripeConfigured(): boolean {
  return Boolean(stripeClient);
}

export async function createStripeCheckoutSession(
  planId: PlanId,
  userId: string,
  email: string
) {
  if (!stripeClient) throw new Error("Stripe not configured");

  const plan = PLANS[planId];
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://audit.acquihiretech.com";

  const session = await stripeClient.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `AcquiHire Audit — ${plan.name}`,
            description: plan.description,
          },
          unit_amount: plan.pricesUSD,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard?upgraded=${planId}`,
    cancel_url: `${baseUrl}/pricing?canceled=1`,
    metadata: {
      user_id: userId,
      plan_id: planId,
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
    },
  });

  return { url: session.url!, sessionId: session.id };
}

export function getStripeClient(): Stripe | null {
  return stripeClient;
}
