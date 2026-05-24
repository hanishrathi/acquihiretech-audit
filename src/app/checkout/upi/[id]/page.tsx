import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { safeAuth } from "@/lib/auth";
import { SiteFooter } from "@/components/SiteFooter";
import { buildUpiUrl, upiQrDataUrl, getUpiConfig } from "@/lib/payments/upi";
import { UpiSubmitForm } from "./UpiSubmitForm";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function UpiCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await safeAuth();
  if (!userId) redirect("/sign-in");

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { data: u } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  const { data: payment } = await supabase
    .from("pending_payments")
    .select("*")
    .eq("id", id)
    .single();

  if (!payment || !u || payment.user_id !== u.id) {
    redirect("/dashboard");
  }

  const cfg = getUpiConfig();
  const amountRupees = payment.amount_inr / 100;
  const upiUrl = buildUpiUrl({
    payeeId: cfg.payeeId,
    payeeName: cfg.payeeName,
    amountRupees,
    reference: payment.upi_reference || payment.id.slice(0, 8),
    note: `AcquiHire ${payment.plan_id} plan`,
  });
  const qr = await upiQrDataUrl(upiUrl);

  return (
    <div className="min-h-screen bg-bg-near-white flex flex-col">
      {/* Minimal dark header */}
      <header className="site-header">
        <div className="max-w-[1024px] mx-auto px-[22px] h-12 flex items-center">
          <a href="/dashboard" className="flex items-center gap-2 text-[14px] text-text-on-dark/90">
            <svg width="26" height="26" viewBox="0 0 44 44" aria-hidden="true">
              <line x1="22" y1="7" x2="37" y2="22" stroke="#f97316" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
              <line x1="37" y1="22" x2="22" y2="37" stroke="#3b82f6" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
              <line x1="22" y1="37" x2="7" y2="22" stroke="#10b981" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
              <line x1="7" y1="22" x2="22" y2="7" stroke="#a855f7" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
              <circle cx="22" cy="7" r="6.5" fill="#f97316" />
              <circle cx="37" cy="22" r="6.5" fill="#3b82f6" />
              <circle cx="22" cy="37" r="6.5" fill="#10b981" />
              <circle cx="7" cy="22" r="6.5" fill="#a855f7" />
            </svg>
            AcquihireTech
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-[720px] w-full mx-auto px-6 py-12">
        <a href="/pricing" className="text-sm text-link hover:text-link-hover">&larr; Back to pricing</a>
        <h1 className="font-display text-3xl font-semibold text-text mt-3 mb-2">
          Pay ₹{amountRupees.toLocaleString("en-IN")} via UPI
        </h1>
        <p className="text-text-secondary mb-8">
          For the <span className="font-medium text-text capitalize">{payment.plan_id}</span> plan.
          Status: <span className="font-mono text-xs">{payment.status}</span>
        </p>

        {payment.status === "awaiting_payment" && (
          <>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* QR */}
              <div className="p-6 rounded-[18px] bg-white border border-border-light text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="UPI QR code" className="w-full max-w-[320px] mx-auto" />
                <p className="text-xs text-text-dim mt-4">
                  Scan with any UPI app — GPay, PhonePe, Paytm, BHIM
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-text-secondary text-xs uppercase tracking-wide mb-1">UPI ID</div>
                  <div className="font-mono text-text break-all">{cfg.payeeId}</div>
                </div>
                <div>
                  <div className="text-text-secondary text-xs uppercase tracking-wide mb-1">Amount</div>
                  <div className="font-display text-2xl font-semibold text-text">₹{amountRupees.toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div className="text-text-secondary text-xs uppercase tracking-wide mb-1">Reference</div>
                  <div className="font-mono text-text">{payment.upi_reference}</div>
                </div>
                <a
                  href={upiUrl}
                  className="block text-center py-3 bg-text text-white rounded-[980px] font-medium text-sm hover:bg-black md:hidden"
                >
                  Open in UPI app
                </a>
              </div>
            </div>

            <div className="mt-10 p-6 rounded-[18px] bg-white border border-border-light">
              <h2 className="font-display text-xl font-semibold text-text mb-2">After paying</h2>
              <p className="text-sm text-text-secondary mb-4">
                Once your UPI app confirms the payment, copy the UTR / transaction ID and paste it below.
                We&apos;ll verify and upgrade your account within a few hours.
              </p>
              <UpiSubmitForm paymentId={payment.id} />
            </div>
          </>
        )}

        {payment.status === "submitted" && (
          <div className="p-8 rounded-[18px] bg-white border border-border-light text-center">
            <div className="text-4xl mb-3">⏳</div>
            <h2 className="font-display text-xl font-semibold text-text mb-2">Payment under review</h2>
            <p className="text-text-secondary text-sm">
              We received your UTR <span className="font-mono">{payment.upi_utr}</span>.
              Our team will verify and upgrade your account within a few hours.
              You&apos;ll get an email when it&apos;s done.
            </p>
          </div>
        )}

        {payment.status === "approved" && (
          <div className="p-8 rounded-[18px] bg-white border border-border-light text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="font-display text-xl font-semibold text-text mb-2">Payment approved</h2>
            <p className="text-text-secondary text-sm mb-4">
              Your {payment.plan_id} plan is active.
            </p>
            <a href="/dashboard" className="inline-block px-6 py-3 bg-text text-white rounded-[980px] font-medium text-sm hover:bg-black">
              Go to dashboard
            </a>
          </div>
        )}

        {payment.status === "rejected" && (
          <div className="p-8 rounded-[18px] bg-white border border-red-200 text-center">
            <div className="text-4xl mb-3">❌</div>
            <h2 className="font-display text-xl font-semibold text-text mb-2">Payment rejected</h2>
            <p className="text-text-secondary text-sm mb-4">
              {payment.rejection_reason || "We could not verify this payment."}
            </p>
            <a href="/pricing" className="inline-block px-6 py-3 bg-text text-white rounded-[980px] font-medium text-sm hover:bg-black">
              Try again
            </a>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
