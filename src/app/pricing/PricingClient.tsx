"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const plans = [
  {
    id: "free",
    name: "Basic",
    price: "Free",
    priceNote: "No credit card required",
    description: "Quick health check for any website",
    features: [
      "1 page audit (homepage)",
      "3 categories (Performance, SEO, Mobile)",
      "~30 checks",
      "Overall health score",
      "Top 3 issues per category",
      "AI Readiness indicator",
      "Email report",
    ],
    limitations: [
      "No improvement suggestions",
      "No fix guides",
      "No historical data",
      "No competitor comparison",
    ],
    cta: "Start Free Audit",
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "₹1,499",
    priceNote: "/mo · ≈ $18",
    description: "Full analysis with actionable suggestions",
    features: [
      "50 pages per audit",
      "7 categories unlocked",
      "~120 checks",
      "Full issue list with severity",
      "Improvement suggestions on every issue",
      "PDF report export",
      "30-day score history",
      "Weekly automated re-crawl",
      "1 competitor comparison",
      "Email support",
    ],
    limitations: [
      "No step-by-step fix guides",
      "No revenue impact estimates",
      "No API access",
    ],
    cta: "Upgrade to Starter",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹4,999",
    priceNote: "/mo · ≈ $60",
    description: "Complete audit with AI-powered fix guides",
    features: [
      "500 pages per audit",
      "All 10 categories",
      "300+ checks",
      "AI-generated fix guides (Claude + GPT-4o)",
      "Revenue impact estimates per issue",
      "90-day score history",
      "Daily monitoring + alerts",
      "Up to 5 competitor comparisons",
      "White-label PDF reports",
      "API access",
      "Priority support",
    ],
    limitations: [],
    cta: "Upgrade to Pro",
    highlighted: false,
  },
];

interface PricingClientProps {
  isSignedIn: boolean;
}

type PayMethod = "upi" | "crypto";

export function PricingClient({ isSignedIn }: PricingClientProps) {
  const [chooserPlan, setChooserPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function startUpgrade(planId: string) {
    setError(null);
    if (planId === "free") {
      router.push("/");
      return;
    }
    if (!isSignedIn) {
      router.push("/sign-up?redirect_url=/pricing");
      return;
    }
    setChooserPlan(planId);
  }

  async function pickMethod(method: PayMethod, chain?: string) {
    if (!chooserPlan) return;
    setLoading(`${method}-${chain || ""}`);
    setError(null);

    try {
      const endpoint =
        method === "upi" ? "/api/checkout/upi" : "/api/checkout/crypto";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: chooserPlan, chain }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start checkout");
        setLoading(null);
        return;
      }
      window.location.href = `/checkout/${method}/${data.paymentId}`;
    } catch (err: any) {
      setError(err.message || "Network error");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteNav variant={isSignedIn ? "app" : "marketing"} />

      <main className="container-wide" style={{ padding: "80px 22px" }}>
        <div className="section-head">
          <span className="eyebrow">Plans</span>
          <h1 className="headline">Simple, transparent pricing</h1>
          <p className="lead">
            Pay via UPI or cryptocurrency. Cancel anytime.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-6 rounded-[18px] border ${
                plan.highlighted
                  ? "border-engine-conversion shadow-lg shadow-engine-conversion/10 ring-1 ring-engine-conversion/20"
                  : "border-border-light"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-engine-conversion text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="font-display text-lg font-semibold text-text mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-3xl font-semibold text-text">{plan.price}</span>
                <span className="text-sm text-text-secondary">{plan.priceNote}</span>
              </div>
              <p className="text-sm text-text-secondary mb-6">{plan.description}</p>

              <button
                onClick={() => startUpgrade(plan.id)}
                disabled={loading !== null}
                className={`btn btn-large w-full ${
                  plan.highlighted ? "btn-primary" : "btn-dark-outline"
                } disabled:opacity-50`}
              >
                {plan.cta}
              </button>

              <ul className="mt-6 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <span className="text-score-excellent mt-0.5">✓</span>
                    <span className="text-text">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation) => (
                  <li key={limitation} className="flex items-start gap-2 text-sm">
                    <span className="text-text-dim mt-0.5">—</span>
                    <span className="text-text-dim">{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Agency Tier */}
        <div className="tile tile-dark" style={{ minHeight: 0, padding: "48px 32px", marginTop: 24 }}>
          <span className="tile-eyebrow">Enterprise</span>
          <h3>Agency Plan — ₹14,999/mo</h3>
          <p className="tile-sub">
            Multi-client management, unlimited audits, white-label reports, custom branding,
            and a dedicated account manager.
          </p>
          <a
            href="https://acquihiretech.com/contact.html"
            className="btn btn-white btn-large"
            style={{ marginBottom: 44 }}
          >
            Contact Sales
          </a>
        </div>
      </main>

      {/* Payment method chooser modal */}
      {chooserPlan && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !loading && setChooserPlan(null)}
        >
          <div
            className="bg-white rounded-[18px] max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-semibold text-text mb-1">
              Choose payment method
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              For the <span className="font-medium text-text capitalize">{chooserPlan}</span> plan
            </p>

            <button
              onClick={() => pickMethod("upi")}
              disabled={loading !== null}
              className="w-full p-4 mb-3 rounded-[12px] border border-border text-left hover:border-text transition-colors disabled:opacity-50 flex items-center gap-3"
            >
              <div className="text-2xl">🇮🇳</div>
              <div className="flex-1">
                <div className="font-medium text-text">UPI / QR Code</div>
                <div className="text-xs text-text-secondary">
                  Pay with any UPI app — GPay, PhonePe, Paytm, BHIM
                </div>
              </div>
              <div className="text-xs text-text-dim">
                {loading === "upi-" ? "..." : "→"}
              </div>
            </button>

            <div className="mb-3">
              <div className="text-xs text-text-secondary uppercase tracking-wide mb-2 px-1">
                Cryptocurrency
              </div>
              {[
                { chain: "btc", label: "Bitcoin (BTC)", icon: "₿" },
                { chain: "eth", label: "Ethereum (ETH)", icon: "Ξ" },
                { chain: "usdc-eth", label: "USDC on Ethereum", icon: "$" },
                { chain: "usdc-polygon", label: "USDC on Polygon", icon: "$" },
              ].map((c) => (
                <button
                  key={c.chain}
                  onClick={() => pickMethod("crypto", c.chain)}
                  disabled={loading !== null}
                  className="w-full p-3 mb-2 rounded-[12px] border border-border text-left hover:border-text transition-colors disabled:opacity-50 flex items-center gap-3"
                >
                  <div className="text-lg font-mono w-6 text-center">{c.icon}</div>
                  <div className="flex-1 text-sm text-text">{c.label}</div>
                  <div className="text-xs text-text-dim">
                    {loading === `crypto-${c.chain}` ? "..." : "→"}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setChooserPlan(null)}
              disabled={loading !== null}
              className="w-full text-center py-2 text-sm text-text-secondary hover:text-text"
            >
              Cancel
            </button>

            {error && <p className="mt-3 text-sm text-score-poor">{error}</p>}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
