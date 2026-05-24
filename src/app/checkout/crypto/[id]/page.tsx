import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { safeAuth } from "@/lib/auth";
import { SiteFooter } from "@/components/SiteFooter";
import {
  CRYPTO_CHAINS,
  addressQrDataUrl,
  type CryptoChain,
} from "@/lib/payments/crypto";
import { CryptoSubmitForm } from "./CryptoSubmitForm";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function CryptoCheckoutPage({
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

  if (!payment || !u || payment.user_id !== u.id || payment.method !== "crypto") {
    redirect("/dashboard");
  }

  const chainCfg = CRYPTO_CHAINS[payment.crypto_chain as CryptoChain];
  const qr = await addressQrDataUrl(payment.crypto_address);
  const amountRupees = payment.amount_inr / 100;

  return (
    <div className="min-h-screen bg-bg-near-white flex flex-col">
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
          Pay with {chainCfg.label}
        </h1>
        <p className="text-text-secondary mb-8">
          <span className="capitalize">{payment.plan_id}</span> plan · Status:{" "}
          <span className="font-mono text-xs">{payment.status}</span>
        </p>

        {payment.status === "awaiting_payment" && (
          <>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="p-6 rounded-[18px] bg-white border border-border-light text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="Wallet address QR" className="w-full max-w-[320px] mx-auto" />
                <p className="text-xs text-text-dim mt-4">
                  Scan with your {chainCfg.symbol} wallet
                </p>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-text-secondary text-xs uppercase tracking-wide mb-1">Send exactly</div>
                  <div className="font-display text-2xl font-semibold text-text font-mono">
                    {payment.crypto_amount_native} {chainCfg.symbol}
                  </div>
                  <div className="text-xs text-text-dim mt-1">
                    ≈ ₹{amountRupees.toLocaleString("en-IN")} at submit time
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary text-xs uppercase tracking-wide mb-1">To address</div>
                  <div className="font-mono text-xs text-text break-all p-2 bg-bg-tint rounded-[8px]">
                    {payment.crypto_address}
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary text-xs uppercase tracking-wide mb-1">Network</div>
                  <div className="text-text">{chainCfg.label}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-[12px] bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
              ⚠️ <strong>Important:</strong> Send the exact amount on the exact network shown.
              Sending less, sending on the wrong network, or sending a different coin will result
              in lost funds. After paying, paste your transaction hash below.
            </div>

            <div className="mt-6 p-6 rounded-[18px] bg-white border border-border-light">
              <h2 className="font-display text-xl font-semibold text-text mb-2">After paying</h2>
              <p className="text-sm text-text-secondary mb-4">
                Paste your transaction hash. We&apos;ll verify on-chain and upgrade your account
                once it has enough confirmations (usually within a few hours).
              </p>
              <CryptoSubmitForm paymentId={payment.id} />
            </div>
          </>
        )}

        {payment.status === "submitted" && (
          <div className="p-8 rounded-[18px] bg-white border border-border-light text-center">
            <div className="text-4xl mb-3">⏳</div>
            <h2 className="font-display text-xl font-semibold text-text mb-2">Verifying on-chain</h2>
            <p className="text-text-secondary text-sm mb-3">
              We received your tx hash:
            </p>
            <a
              href={chainCfg.explorerTx(payment.crypto_tx_hash)}
              target="_blank"
              rel="noreferrer"
              className="inline-block font-mono text-xs text-link hover:text-link-hover break-all max-w-md mx-auto"
            >
              {payment.crypto_tx_hash} ↗
            </a>
            <p className="text-text-secondary text-sm mt-4">
              You&apos;ll get an email when your account is upgraded.
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
              {payment.rejection_reason || "We could not verify this payment on-chain."}
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
