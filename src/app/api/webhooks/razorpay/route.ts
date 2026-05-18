import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { verifyRazorpayWebhook } from "@/lib/payments/razorpay";
import type { PlanId } from "@/lib/payments/plans";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  const body = await req.text();
  const headerStore = await headers();
  const signature = headerStore.get("x-razorpay-signature") || "";

  if (!verifyRazorpayWebhook(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    // We handle payment.captured (most reliable) — order.paid is fired before
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const order = event.payload.order?.entity;
      const userId = order?.notes?.user_id || payment.notes?.user_id;
      const planId = (order?.notes?.plan_id || payment.notes?.plan_id) as PlanId;

      if (userId && planId) {
        // Set plan expiry 31 days out (monthly)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 31);

        await supabase
          .from("users")
          .update({
            plan: planId,
            plan_expires_at: expiresAt.toISOString(),
            razorpay_customer_id: payment.customer_id || null,
            crawls_remaining: 999, // generous for paid users
          })
          .eq("id", userId);
      }
    }
  } catch (err: any) {
    console.error("[razorpay webhook] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, type: event.event });
}
