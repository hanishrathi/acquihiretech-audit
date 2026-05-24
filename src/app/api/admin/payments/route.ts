import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { safeAuth, safeCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import type { PlanId } from "@/lib/payments/plans";
import { sendProductDownloadEmail } from "@/lib/notifications/customer-emails";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function adminGuard(): Promise<{ ok: boolean; email?: string; status?: number }> {
  const { userId } = await safeAuth();
  if (!userId) return { ok: false, status: 401 };
  const clerkUser = await safeCurrentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!isAdminEmail(email)) return { ok: false, status: 403 };
  return { ok: true, email };
}

// List pending payments
export async function GET() {
  const guard = await adminGuard();
  if (!guard.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: guard.status });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from("pending_payments")
    .select("*")
    .in("status", ["submitted", "awaiting_payment"])
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ payments: data });
}

// Approve or reject a payment
export async function POST(req: Request) {
  const guard = await adminGuard();
  if (!guard.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: guard.status });
  }

  const body = await req.json();
  const paymentId = body.paymentId as string;
  const action = body.action as "approve" | "reject";
  const reason = body.reason as string | undefined;

  if (!paymentId || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { data: payment, error: pErr } = await supabase
    .from("pending_payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (pErr || !payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (action === "reject") {
    await supabase
      .from("pending_payments")
      .update({
        status: "rejected",
        rejection_reason: reason || "Rejected by admin",
        reviewed_by: guard.email,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", paymentId);
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  // Approve — branch by item type
  let approvalNote = "";

  if (payment.plan_id) {
    // Plan upgrade: bump user's plan + give them generous crawls
    const planId = payment.plan_id as PlanId;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 31);

    await supabase
      .from("users")
      .update({
        plan: planId,
        plan_expires_at: expiresAt.toISOString(),
        crawls_remaining: 999,
      })
      .eq("id", payment.user_id);

    approvalNote = `plan upgraded to ${planId}`;
  } else if (payment.product_slug) {
    // Product order: email the download link to the buyer
    const result = await sendProductDownloadEmail(payment);
    if (!result.ok) {
      console.error("[admin] product email failed:", result.error);
      // Don't block approval on email failure — admin can resend manually
      approvalNote = `product approved BUT email failed: ${result.error}`;
    } else {
      approvalNote = `download emailed to ${payment.user_email}`;
    }
  }

  await supabase
    .from("pending_payments")
    .update({
      status: "approved",
      reviewed_by: guard.email,
      reviewed_at: new Date().toISOString(),
      download_emailed_at: payment.product_slug
        ? new Date().toISOString()
        : null,
    })
    .eq("id", paymentId);

  return NextResponse.json({
    ok: true,
    status: "approved",
    note: approvalNote,
  });
}
