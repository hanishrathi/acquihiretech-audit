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

      {/* ── DARK HERO — matches acquihiretech.com .hero-3d ── */}
      <section className="hero-3d">
        <div className="container">
          <span className="eyebrow">300+ checks across 10 categories · AI-powered</span>
          <h1 className="display">
            Audit your website
            <br />in 60 seconds
          </h1>
          <p className="lead">
            Free AI-powered analysis. Performance, SEO, security, accessibility,
            and the only AI Readiness score on the market.
          </p>

          {/* URL form (step 1) */}
          {step === "url" && (
            <form onSubmit={handleUrlSubmit} className="mt-4">
              <div className="hero-url-form">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com"
                  autoFocus
                />
                <button type="submit" className="btn btn-white btn-large">
                  Audit Free
                </button>
              </div>
              {error && (
                <p className="hero-note" style={{ color: "#ff6b6b" }}>{error}</p>
              )}
              <p className="hero-note">
                Free forever · No credit card required
              </p>
            </form>
          )}

          {/* Email capture (step 2) */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="mt-4">
              <p
                className="hero-note"
                style={{
                  color: "rgba(245,245,247,0.7)",
                  marginTop: 0,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              >
                We&apos;ll email your full report and weekly performance tips.
              </p>
              <div className="hero-url-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoFocus
                />
                <button type="submit" className="btn btn-white btn-large">
                  Start Audit
                </button>
              </div>
              {error && (
                <p className="hero-note" style={{ color: "#ff6b6b" }}>{error}</p>
              )}
              <button
                type="button"
                onClick={() => setStep("url")}
                className="hero-note"
                style={{
                  background: "transparent",
                  border: 0,
                  color: "rgba(245,245,247,0.6)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: 4,
                }}
              >
                ← Change URL
              </button>
            </form>
          )}

          {/* Loading */}
          {step === "loading" && (
            <div
              className="mt-6 mx-auto"
              style={{ maxWidth: 560, width: "100%" }}
            >
              <div
                style={{
                  padding: 32,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.1)",
                    overflow: "hidden",
                    marginBottom: 18,
                  }}
                >
                  <div
                    className="crawl-progress-bar"
                    style={{ height: "100%", width: "60%", borderRadius: 999 }}
                  />
                </div>
                <p
                  style={{
                    color: "rgba(245,245,247,0.85)",
                    fontSize: 14,
                  }}
                >
                  Analyzing {url}...
                </p>
                <p
                  style={{
                    color: "rgba(245,245,247,0.5)",
                    fontSize: 12,
                    marginTop: 6,
                  }}
                >
                  Running performance, SEO, security, AI readiness checks
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── PROOF BAR ── */}
      <section className="proof-bar">
        <div className="container">
          <p className="proof-bar-label">Built different from</p>
          <div
            className="flex flex-wrap items-center justify-center gap-8"
            style={{ color: "rgba(245,245,247,0.5)", fontSize: 14 }}
          >
            <span>Google PageSpeed Insights</span>
            <span>·</span>
            <span>Screaming Frog</span>
            <span>·</span>
            <span>Ubersuggest</span>
            <span>·</span>
            <span>SEMrush</span>
          </div>
        </div>
      </section>

      {/* Dark→light bridge */}
      <div
        style={{
          height: 48,
          background: "linear-gradient(to bottom, #0f0e10, var(--bg))",
        }}
      />

      {/* ── FEATURE TILES (BENTO) ── */}
      <section style={{ padding: "20px 0 60px" }}>
        <div className="container-wide">
          <div className="section-head">
            <span className="eyebrow">What you get</span>
            <h2 className="headline">Built different</h2>
            <p className="lead">
              Other tools tell you what&apos;s broken. We tell you what to do,
              ranked by business impact.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-3">
            <div className="tile tile-light">
              <span className="tile-eyebrow">Engine 01</span>
              <h3>10 Audit Engines</h3>
              <p className="tile-sub">
                Performance, SEO, Security, Mobile, Accessibility, Content,
                Technical, AI Readiness, Conversion, Brand.
              </p>
            </div>
            <div className="tile tile-tint">
              <span className="tile-eyebrow">Engine 02</span>
              <h3>AI-Powered Insights</h3>
              <p className="tile-sub">
                Claude and GPT-4o read your content, your brand consistency,
                and your conversion structure.
              </p>
            </div>
            <div className="tile tile-dark">
              <span className="tile-eyebrow">Engine 03</span>
              <h3>Revenue Impact</h3>
              <p className="tile-sub">
                Each issue is ranked by estimated impact on leads and revenue,
                so you fix what matters first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section style={{ padding: "60px 0", background: "var(--bg-tint)" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Vs other tools</span>
            <h2 className="headline">Why AcquiHire Audit</h2>
          </div>
          <div
            className="overflow-x-auto rounded-[18px] border border-border-light"
            style={{ background: "var(--bg)" }}
          >
            <table
              className="w-full border-collapse"
              style={{ fontSize: 15 }}
            >
              <thead>
                <tr
                  className="border-b border-border-light"
                  style={{ background: "var(--bg-near-white)" }}
                >
                  <th
                    className="py-4 px-5 text-left"
                    style={{ color: "var(--text-secondary)", fontWeight: 500 }}
                  >
                    Feature
                  </th>
                  <th
                    className="py-4 px-5 text-center"
                    style={{ color: "var(--text-secondary)", fontWeight: 500 }}
                  >
                    Google PSI
                  </th>
                  <th
                    className="py-4 px-5 text-center"
                    style={{ color: "var(--text-secondary)", fontWeight: 500 }}
                  >
                    Screaming Frog
                  </th>
                  <th
                    className="py-4 px-5 text-center"
                    style={{ color: "var(--text)", fontWeight: 600 }}
                  >
                    AcquiHire
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Multi-page crawl", "No", "Yes", "Yes"],
                  ["AI Readiness audit", "No", "No", "Yes"],
                  ["Step-by-step fixes", "No", "No", "Yes"],
                  ["Revenue impact scoring", "No", "No", "Yes"],
                  ["Cloud-based", "Yes", "No", "Yes"],
                  ["Free tier", "1 page", "500 URLs", "Full audit"],
                ].map(([feature, psi, sf, ah]) => (
                  <tr
                    key={feature}
                    className="border-b border-border-light last:border-0"
                  >
                    <td className="py-3 px-5" style={{ color: "var(--text)" }}>
                      {feature}
                    </td>
                    <td
                      className="py-3 px-5 text-center"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {psi}
                    </td>
                    <td
                      className="py-3 px-5 text-center"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {sf}
                    </td>
                    <td
                      className="py-3 px-5 text-center"
                      style={{
                        color: "var(--score-excellent)",
                        fontWeight: 600,
                      }}
                    >
                      {ah}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
