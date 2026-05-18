import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getStripeClient } from "@/lib/payments/stripe";
import type { PlanId } from "@/lib/payments/plans";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await req.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature") || "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id as PlanId;
        const customerId = session.customer as string;

        if (userId && planId) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 31);

          await supabase
            .from("users")
            .update({
              plan: planId,
              plan_expires_at: expiresAt.toISOString(),
              stripe_customer_id: customerId,
              crawls_remaining: 999,
            })
            .eq("id", userId);
        }
        break;
      }
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const userId = sub.metadata?.user_id;
        if (!userId) break;

        if (event.type === "customer.subscription.deleted" || sub.status !== "active") {
          await supabase
            .from("users")
            .update({ plan: "free", plan_expires_at: null, crawls_remaining: 3 })
            .eq("id", userId);
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const userId = invoice.subscription_details?.metadata?.user_id;
        const planId = invoice.subscription_details?.metadata?.plan_id;
        if (userId && planId) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 31);
          await supabase
            .from("users")
            .update({ plan: planId, plan_expires_at: expiresAt.toISOString() })
            .eq("id", userId);
        }
        break;
      }
    }
  } catch (err: any) {
    console.error("[stripe webhook] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, type: event.type });
}
