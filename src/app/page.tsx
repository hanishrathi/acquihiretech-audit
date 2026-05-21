"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"url" | "email" | "loading">("url");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }

    let testUrl = url.trim();
    if (!testUrl.startsWith("http://") && !testUrl.startsWith("https://")) {
      testUrl = `https://${testUrl}`;
    }
    try {
      new URL(testUrl);
    } catch {
      setError("Please enter a valid URL (e.g., example.com)");
      return;
    }

    setStep("email");
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setStep("loading");

    try {
      const response = await fetch("/api/audit/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStep("email");
        return;
      }

      router.push(`/report/${data.auditId}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStep("email");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav variant="marketing" />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16">
        <div className="max-w-[720px] w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-tint border border-border-light text-xs text-text-secondary mb-6">
            <span className="w-2 h-2 rounded-full bg-score-excellent animate-pulse" />
            300+ checks across 10 categories
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-[-0.015em] text-text leading-[1.05] mb-4">
            Audit your website
            <br />
            <span className="bg-gradient-to-r from-engine-growth via-engine-conversion to-engine-operations bg-clip-text text-transparent">
              in 60 seconds
            </span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-[540px] mx-auto mb-10">
            Free AI-powered analysis. Performance, SEO, security, accessibility, and the only{" "}
            <strong className="text-text">AI Readiness</strong> score on the market.
          </p>

          {/* URL Input Form */}
          {step === "url" && (
            <form onSubmit={handleUrlSubmit} className="w-full max-w-[560px] mx-auto">
              <div className="flex items-center gap-3 p-2 rounded-[18px] bg-bg-tint border border-border shadow-lg shadow-black/5">
                <div className="flex-1 flex items-center gap-3 pl-4">
                  <svg className="w-5 h-5 text-text-dim shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter your website URL..."
                    className="flex-1 bg-transparent text-text placeholder:text-text-dim outline-none text-base py-3"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-text text-white rounded-[980px] font-medium text-sm hover:bg-black transition-all hover:shadow-lg"
                >
                  Audit Free
                </button>
              </div>
              {error && <p className="mt-3 text-sm text-score-poor">{error}</p>}
            </form>
          )}

          {/* Email Capture Step */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="w-full max-w-[560px] mx-auto">
              <p className="text-sm text-text-secondary mb-4">
                We&apos;ll email your full report and weekly performance tips.
              </p>
              <div className="flex items-center gap-3 p-2 rounded-[18px] bg-bg-tint border border-border shadow-lg shadow-black/5">
                <div className="flex-1 flex items-center gap-3 pl-4">
                  <svg className="w-5 h-5 text-text-dim shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent text-text placeholder:text-text-dim outline-none text-base py-3"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-text text-white rounded-[980px] font-medium text-sm hover:bg-black transition-all hover:shadow-lg"
                >
                  Start Audit
                </button>
              </div>
              {error && <p className="mt-3 text-sm text-score-poor">{error}</p>}
              <button
                type="button"
                onClick={() => setStep("url")}
                className="mt-3 text-sm text-link hover:text-link-hover"
              >
                &larr; Change URL
              </button>
            </form>
          )}

          {/* Loading State */}
          {step === "loading" && (
            <div className="w-full max-w-[560px] mx-auto">
              <div className="p-8 rounded-[18px] bg-bg-tint border border-border-light">
                <div className="w-full h-2 rounded-full bg-border-light overflow-hidden mb-6">
                  <div className="h-full crawl-progress-bar rounded-full w-[60%]" />
                </div>
                <p className="text-sm text-text-secondary animate-pulse">
                  Analyzing {url}...
                </p>
                <p className="text-xs text-text-dim mt-2">
                  Running performance, SEO, and mobile checks
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Feature Grid */}
        <div className="max-w-[980px] w-full mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
          {[
            {
              icon: "⚡",
              title: "10 Audit Engines",
              description: "Performance, SEO, Security, Mobile, Accessibility, Content, Technical, AI Readiness, Conversion, Brand",
            },
            {
              icon: "🤖",
              title: "AI-Powered Insights",
              description: "Claude + GPT-4o analyze your content quality, brand consistency, and conversion potential",
            },
            {
              icon: "📊",
              title: "Revenue Impact Scoring",
              description: "Know exactly which fixes will generate the most leads and revenue for your business",
            },
          ].map((feature) => (
            <div key={feature.title} className="p-6 rounded-[18px] bg-bg-tint border border-border-light">
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="font-display font-semibold text-text mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="max-w-[980px] w-full mt-16 px-6">
          <h2 className="font-display text-2xl font-semibold text-center text-text mb-8">
            Why AcquiHire Audit?
          </h2>
          <div className="overflow-x-auto rounded-[18px] border border-border-light">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-light bg-bg-tint">
                  <th className="py-3 px-4 text-left text-text-secondary font-medium">Feature</th>
                  <th className="py-3 px-4 text-center text-text-secondary font-medium">Google PSI</th>
                  <th className="py-3 px-4 text-center text-text-secondary font-medium">Screaming Frog</th>
                  <th className="py-3 px-4 text-center font-bold text-text">AcquiHire</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Multi-page crawl", "No", "Yes", "Yes"],
                  ["AI Readiness audit", "No", "No", "Yes"],
                  ["Step-by-step fixes", "No", "No", "Yes"],
                  ["Revenue impact scoring", "No", "No", "Yes"],
                  ["Cloud-based", "Yes", "No", "Yes"],
                  ["Free tier", "1 page", "500 URLs", "Full homepage"],
                ].map(([feature, psi, sf, ah]) => (
                  <tr key={feature} className="border-b border-border-light last:border-0">
                    <td className="py-3 px-4 text-text">{feature}</td>
                    <td className="py-3 px-4 text-center text-text-dim">{psi}</td>
                    <td className="py-3 px-4 text-center text-text-dim">{sf}</td>
                    <td className="py-3 px-4 text-center font-medium text-score-excellent">{ah}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
