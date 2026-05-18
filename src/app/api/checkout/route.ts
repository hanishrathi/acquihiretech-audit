import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/db/user";
import { PLANS, getProviderForCountry, type PlanId } from "@/lib/payments/plans";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/payments/razorpay";
import {
  createStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/payments/stripe";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const planId = body.planId as PlanId;

  if (!planId || !PLANS[planId]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress || "";
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;

  // Detect country from IP via Vercel header (falls back to IN)
  const country =
    req.headers.get("x-vercel-ip-country") ||
    body.country ||
    "IN";

  const user = await ensureUser(userId, email, name, country);
  if (!user) {
    return NextResponse.json(
      { error: "Failed to create user record" },
      { status: 500 }
    );
  }

  const provider = getProviderForCountry(country);

  try {
    if (provider === "razorpay") {
      if (!isRazorpayConfigured()) {
        return NextResponse.json(
          { error: "Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." },
          { status: 503 }
        );
      }
      const order = await createRazorpayOrder(planId, user.id);
      return NextResponse.json({ provider: "razorpay", ...order });
    } else {
      if (!isStripeConfigured()) {
        return NextResponse.json(
          { error: "Stripe not configured. Set STRIPE_SECRET_KEY." },
          { status: 503 }
        );
      }
      const session = await createStripeCheckoutSession(planId, user.id, email);
      return NextResponse.json({ provider: "stripe", ...session });
    }
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
