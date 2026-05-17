import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — AcquiHire Audit",
  description: "Free, Starter, and Pro plans for website auditing. Starting at ₹1,499/mo.",
};

const plans = [
  {
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
    name: "Starter",
    price: "₹1,499",
    priceNote: "/month (≈ $18)",
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
    cta: "Start 7-Day Trial",
    ctaHref: "/dashboard",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "₹4,999",
    priceNote: "/month (≈ $60)",
    description: "Complete audit with AI-powered fix guides",
    features: [
      "500 pages per audit",
      "All 10 categories (incl. AI Readiness, Conversion, Brand)",
      "300+ checks",
      "Step-by-step fix guides with code snippets",
      "Revenue impact estimates per issue",
      "90-day score history",
      "Daily monitoring + alerts",
      "Up to 5 competitor comparisons",
      "White-label PDF reports",
      "API access",
      "Priority support",
      "Quarterly strategy call",
    ],
    limitations: [],
    cta: "Start Pro Trial",
    ctaHref: "/dashboard",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
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
            <a href="/" className="text-sm text-text-secondary hover:text-text transition-colors">Home</a>
            <a href="/dashboard" className="text-sm px-4 py-1.5 bg-bg-dark text-white rounded-full hover:bg-black transition-colors">Sign In</a>
          </div>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-text mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-text-secondary max-w-lg mx-auto">
            Start free, upgrade when you need deeper analysis. Cancel anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
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

              <h3 className="font-display text-lg font-bold text-text mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-3xl font-extrabold text-text">
                  {plan.price}
                </span>
                <span className="text-sm text-text-secondary">
                  {plan.priceNote}
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-6">
                {plan.description}
              </p>

              <a
                href={plan.ctaHref}
                className={`block w-full text-center py-3 rounded-[12px] font-medium text-sm transition-all ${
                  plan.highlighted
                    ? "bg-engine-conversion text-white hover:opacity-90"
                    : "bg-bg-dark text-white hover:bg-black"
                }`}
              >
                {plan.cta}
              </a>

              {/* Features */}
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
          <h2 className="font-display text-2xl font-bold mb-2">
            Agency Plan — ₹14,999/mo
          </h2>
          <p className="text-text-on-dark-muted mb-6 max-w-lg mx-auto">
            Multi-client management, unlimited audits, white-label reports,
            custom branding, and a dedicated account manager.
          </p>
          <a
            href="https://acquihiretech.com/contact.html"
            className="inline-flex px-6 py-3 bg-white text-bg-dark rounded-[12px] font-medium text-sm hover:bg-bg-tint transition-colors"
          >
            Contact Sales
          </a>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-[680px] mx-auto">
          <h2 className="font-display text-2xl font-bold text-text text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What happens after my free audit?",
                a: "You get a full health score with the top 3 issues per category. Your data is saved — upgrading instantly reveals the full analysis without re-crawling.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Monthly billing with no lock-in. Cancel from your dashboard and keep access until the end of your billing period.",
              },
              {
                q: "How does the AI Readiness score work?",
                a: "We check your site's compatibility with AI crawlers (ChatGPT, Claude, Perplexity), structured data quality, content extractability, and E-E-A-T signals.",
              },
              {
                q: "Do you offer annual billing?",
                a: "Yes — save 20% with annual billing. Starter: ₹14,389/yr. Pro: ₹47,990/yr.",
              },
              {
                q: "What payment methods do you accept?",
                a: "UPI, credit/debit cards, net banking (via Razorpay) for India. International cards via Stripe.",
              },
            ].map((faq) => (
              <details key={faq.q} className="group p-4 rounded-[12px] border border-border-light">
                <summary className="cursor-pointer font-medium text-text text-sm flex items-center justify-between">
                  {faq.q}
                  <span className="text-text-dim group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
