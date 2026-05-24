import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { safeAuth } from "@/lib/auth";
import { notifyAdminsOfSubmission } from "@/lib/notifications/admin-alerts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function client() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// Submit UTR after paying
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await safeAuth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const utr: string = (body.utr || "").trim();
  if (!utr || utr.length < 6 || utr.length > 50) {
    return NextResponse.json(
      { error: "Please enter a valid UTR / transaction reference (6-50 chars)" },
      { status: 400 }
    );
  }

  const supabase = client();

  // Lookup payment + verify ownership via clerk_id -> users.id
  const { data: u } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();
  if (!u) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: payment, error: pErr } = await supabase
    .from("pending_payments")
    .select("*")
    .eq("id", id)
    .single();

  if (pErr || !payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  if (payment.user_id !== u.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (payment.status !== "awaiting_payment") {
    return NextResponse.json(
      { error: `Payment already ${payment.status}` },
      { status: 400 }
    );
  }

  const { error: updErr } = await supabase
    .from("pending_payments")
    .update({ upi_utr: utr, status: "submitted" })
    .eq("id", id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  // Fire-and-forget admin email — never block the response
  notifyAdminsOfSubmission({ ...payment, upi_utr: utr, status: "submitted" }).catch(
    (e) => console.error("[notify] admin alert failed:", e)
  );

  return NextResponse.json({ ok: true, status: "submitted" });
}
