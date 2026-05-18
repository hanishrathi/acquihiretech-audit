"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    ctaHref: "/",
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

export function PricingClient({ isSignedIn }: PricingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpgrade(planId: string) {
    if (planId === "free") {
      router.push("/");
      return;
    }

    if (!isSignedIn) {
      router.push(`/sign-up?redirect_url=/pricing`);
      return;
    }

    setLoading(planId);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Checkout failed. Please try again.");
        setLoading(null);
        return;
      }

      if (data.provider === "stripe" && data.url) {
        window.location.href = data.url;
      } else if (data.provider === "razorpay") {
        // Load Razorpay checkout dynamically
        await loadRazorpayScript();
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: "AcquiHire Audit",
          description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} plan subscription`,
          handler: function () {
            window.location.href = `/dashboard?upgraded=${planId}`;
          },
          theme: { color: "#1d1d1f" },
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(null);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-light">
        <div className="max-w-[980px] mx-auto px-6 h-12 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-sm">
            <svg width="24" height="24" viewBox="0 0 44 44">
              <circle cx="22" cy="7" r="6.5" fill="#f97316" />
              <circle cx="37" cy="22" r="6.5" fill="#3b82f6" />
              <circle cx="22" cy="37" r="6.5" fill="#10b981" />
              <circle cx="7" cy="22" r="6.5" fill="#a855f7" />
            </svg>
            <span className="font-display font-bold text-text">AcquiHire Audit</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/" className="text-sm text-text-secondary hover:text-text">Home</a>
            <a
              href={isSignedIn ? "/dashboard" : "/sign-in"}
              className="text-sm px-4 py-1.5 bg-bg-dark text-white rounded-full hover:bg-black"
            >
              {isSignedIn ? "Dashboard" : "Sign In"}
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-text mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-text-secondary max-w-lg mx-auto">
            Start free, upgrade when you need deeper analysis. Cancel anytime.
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

              <h3 className="font-display text-lg font-bold text-text mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-3xl font-extrabold text-text">{plan.price}</span>
                <span className="text-sm text-text-secondary">{plan.priceNote}</span>
              </div>
              <p className="text-sm text-text-secondary mb-6">{plan.description}</p>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading !== null}
                className={`block w-full text-center py-3 rounded-[12px] font-medium text-sm transition-all disabled:opacity-50 ${
                  plan.highlighted
                    ? "bg-engine-conversion text-white hover:opacity-90"
                    : "bg-bg-dark text-white hover:bg-black"
                }`}
              >
                {loading === plan.id ? "Loading..." : plan.cta}
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
        <div className="p-8 rounded-[18px] bg-bg-dark text-white text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Agency Plan — ₹14,999/mo</h2>
          <p className="text-text-on-dark-muted mb-6 max-w-lg mx-auto">
            Multi-client management, unlimited audits, white-label reports, custom branding, and a dedicated account manager.
          </p>
          <a
            href="https://acquihiretech.com/contact.html"
            className="inline-flex px-6 py-3 bg-white text-bg-dark rounded-[12px] font-medium text-sm hover:bg-bg-tint"
          >
            Contact Sales
          </a>
        </div>
      </main>
    </div>
  );
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      return resolve();
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}
