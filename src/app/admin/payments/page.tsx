import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { safeAuth, safeCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { SiteFooter } from "@/components/SiteFooter";
import { CRYPTO_CHAINS, type CryptoChain } from "@/lib/payments/crypto";
import { AdminPaymentActions } from "./AdminPaymentActions";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function AdminPaymentsPage() {
  const { userId } = await safeAuth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await safeCurrentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!isAdminEmail(email)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-text mb-2">Not authorized</h1>
          <p className="text-text-secondary text-sm">
            Your email ({email}) is not in the admin allowlist.
            Add it to <code className="font-mono">ADMIN_EMAILS</code> in Vercel.
          </p>
        </div>
      </div>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { data: payments } = await supabase
    .from("pending_payments")
    .select("*")
    .in("status", ["submitted", "awaiting_payment"])
    .order("created_at", { ascending: false })
    .limit(100);

  const submitted = (payments || []).filter((p) => p.status === "submitted");
  const awaiting = (payments || []).filter((p) => p.status === "awaiting_payment");

  return (
    <div className="min-h-screen bg-bg-near-white flex flex-col">
      <header className="site-header">
        <div className="max-w-[1200px] mx-auto px-[22px] h-12 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2 text-[14px] text-text-on-dark/90">
            <svg width="26" height="26" viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="7" r="6.5" fill="#f97316" />
              <circle cx="37" cy="22" r="6.5" fill="#3b82f6" />
              <circle cx="22" cy="37" r="6.5" fill="#10b981" />
              <circle cx="7" cy="22" r="6.5" fill="#a855f7" />
            </svg>
            AcquihireTech · Admin
          </a>
          <span className="text-[12px] text-text-on-dark/80">{email}</span>
        </div>
      </header>

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-text mb-1">Pending payments</h1>
        <p className="text-text-secondary mb-8">
          {submitted.length} awaiting review · {awaiting.length} not yet paid
        </p>

        {submitted.length === 0 && awaiting.length === 0 && (
          <div className="p-8 rounded-[18px] bg-white border border-border-light text-center text-text-secondary">
            No pending payments.
          </div>
        )}

        {submitted.length > 0 && (
          <>
            <h2 className="font-display text-xl font-semibold text-text mt-8 mb-4">
              Submitted — needs your review
            </h2>
            <div className="space-y-3">
              {submitted.map((p) => (
                <PaymentCard key={p.id} payment={p} />
              ))}
            </div>
          </>
        )}

        {awaiting.length > 0 && (
          <>
            <h2 className="font-display text-xl font-semibold text-text mt-10 mb-4">
              Awaiting payment (not yet submitted)
            </h2>
            <div className="space-y-3">
              {awaiting.map((p) => (
                <PaymentCard key={p.id} payment={p} />
              ))}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function PaymentCard({ payment }: { payment: any }) {
  const chainCfg = payment.crypto_chain
    ? CRYPTO_CHAINS[payment.crypto_chain as CryptoChain]
    : null;
  const amount = (payment.amount_inr / 100).toLocaleString("en-IN");
  return (
    <div className="p-5 rounded-[18px] bg-white border border-border-light">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-bg-tint text-text font-medium uppercase">
              {payment.method}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium uppercase">
              {payment.plan_id}
            </span>
            <span className="font-display text-lg font-semibold text-text">₹{amount}</span>
          </div>
          <p className="text-sm text-text-secondary">{payment.user_email}</p>
          <p className="text-xs text-text-dim mt-1">
            Created {new Date(payment.created_at).toLocaleString()}
          </p>

          {payment.method === "upi" && (
            <div className="mt-3 text-sm">
              <div>
                Reference:{" "}
                <span className="font-mono text-text">{payment.upi_reference}</span>
              </div>
              {payment.upi_utr && (
                <div>
                  UTR: <span className="font-mono text-text">{payment.upi_utr}</span>
                </div>
              )}
            </div>
          )}

          {payment.method === "crypto" && (
            <div className="mt-3 text-sm space-y-1">
              <div>
                Chain: <span className="text-text">{chainCfg?.label}</span>
              </div>
              <div>
                Amount:{" "}
                <span className="font-mono text-text">
                  {payment.crypto_amount_native} {chainCfg?.symbol}
                </span>
              </div>
              <div>
                To address:{" "}
                <span className="font-mono text-xs text-text break-all">
                  {payment.crypto_address}
                </span>
              </div>
              {payment.crypto_tx_hash && chainCfg && (
                <div>
                  Tx:{" "}
                  <a
                    href={chainCfg.explorerTx(payment.crypto_tx_hash)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-link hover:text-link-hover break-all"
                  >
                    {payment.crypto_tx_hash} ↗
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {payment.status === "submitted" && (
          <AdminPaymentActions paymentId={payment.id} />
        )}
      </div>
    </div>
  );
}
