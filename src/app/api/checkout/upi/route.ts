import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { safeAuth, safeCurrentUser } from "@/lib/auth";
import { ensureUser } from "@/lib/db/user";
import { PLANS, type PlanId } from "@/lib/payments/plans";
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
  const planId = body.planId as PlanId;
  if (!planId || !PLANS[planId]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const clerkUser = await safeCurrentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress || "";
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
  const user = await ensureUser(userId, email, name);
  if (!user) {
    return NextResponse.json({ error: "User record failed" }, { status: 500 });
  }

  const plan = PLANS[planId];
  const reference = generateUpiReference();

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { data: payment, error } = await supabase
    .from("pending_payments")
    .insert({
      user_id: user.id,
      user_email: email,
      plan_id: planId,
      method: "upi",
      amount_inr: plan.pricesINR,
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
