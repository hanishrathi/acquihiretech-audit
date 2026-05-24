import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { safeAuth, safeCurrentUser } from "@/lib/auth";
import { ensureUser } from "@/lib/db/user";
import { PLANS, type PlanId } from "@/lib/payments/plans";
import { getProductBySlug } from "@/lib/products";
import {
  isUpiConfigured,
  generateUpiReference,
} from "@/lib/payments/upi";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  const { userId } = await safeAuth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isUpiConfigured()) {
    return NextResponse.json(
      { error: "UPI not configured (UPI_PAYEE_ID + UPI_PAYEE_NAME required)" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const planId = body.planId as PlanId | undefined;
  const productSlug = body.productSlug as string | undefined;

  if (!planId && !productSlug) {
    return NextResponse.json(
      { error: "planId or productSlug required" },
      { status: 400 }
    );
  }
  if (planId && !PLANS[planId]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  const product = productSlug ? getProductBySlug(productSlug) : null;
  if (productSlug && !product) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const clerkUser = await safeCurrentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress || "";
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
  const user = await ensureUser(userId, email, name);
  if (!user) {
    return NextResponse.json({ error: "User record failed" }, { status: 500 });
  }

  const amount = planId ? PLANS[planId].pricesINR : product!.priceINR;
  const reference = generateUpiReference();

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { data: payment, error } = await supabase
    .from("pending_payments")
    .insert({
      user_id: user.id,
      user_email: email,
      plan_id: planId || null,
      product_slug: productSlug || null,
      method: "upi",
      amount_inr: amount,
      upi_reference: reference,
      status: "awaiting_payment",
    })
    .select()
    .single();

  if (error || !payment) {
    return NextResponse.json(
      { error: error?.message || "Failed to create payment" },
      { status: 500 }
    );
  }

  return NextResponse.json({ paymentId: payment.id });
}
