"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  slug: string;
  title: string;
  isSignedIn: boolean;
}

type PayMethod = "upi" | "crypto";

export function ProductBuyButton({ slug, isSignedIn }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-open buy modal when arriving from the main-site cPanel page via ?buy=1
  // (or send to sign-up if not authed yet)
  useEffect(() => {
    if (searchParams.get("buy") === "1") {
      if (!isSignedIn) {
        router.push(
          `/sign-up?redirect_url=${encodeURIComponent(`/shop/${slug}?buy=1`)}`
        );
      } else {
        setOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function start() {
    setError(null);
    if (!isSignedIn) {
      router.push(
        `/sign-up?redirect_url=${encodeURIComponent(`/shop/${slug}?buy=1`)}`
      );
      return;
    }
    setOpen(true);
  }

  async function pick(method: PayMethod, chain?: string) {
    setLoading(`${method}-${chain || ""}`);
    setError(null);
    try {
      const endpoint =
        method === "upi" ? "/api/checkout/upi" : "/api/checkout/crypto";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: slug, chain }),
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
    <>
      <button
        onClick={start}
        className="btn btn-primary btn-large w-full"
        style={{ width: "100%" }}
      >
        Buy now
      </button>
      {error && (
        <p
          style={{
            marginTop: 10,
            fontSize: 13,
            color: "var(--score-poor)",
          }}
        >
          {error}
        </p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="bg-white rounded-[18px] max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Choose payment method
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                marginBottom: 22,
              }}
            >
              For: <span style={{ fontWeight: 500, color: "var(--text)" }}>{slug}</span>
            </p>

            <button
              onClick={() => pick("upi")}
              disabled={loading !== null}
              className="w-full p-4 mb-3 rounded-[12px] border border-border text-left hover:border-text transition-colors disabled:opacity-50 flex items-center gap-3"
            >
              <div style={{ fontSize: 22 }}>🇮🇳</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>UPI / QR Code</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  GPay, PhonePe, Paytm, BHIM
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                {loading === "upi-" ? "..." : "→"}
              </div>
            </button>

            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  marginBottom: 8,
                  paddingLeft: 4,
                }}
              >
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
                  onClick={() => pick("crypto", c.chain)}
                  disabled={loading !== null}
                  className="w-full p-3 mb-2 rounded-[12px] border border-border text-left hover:border-text transition-colors disabled:opacity-50 flex items-center gap-3"
                >
                  <div
                    style={{
                      width: 24,
                      textAlign: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: 18,
                    }}
                  >
                    {c.icon}
                  </div>
                  <div style={{ flex: 1, fontSize: 14 }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                    {loading === `crypto-${c.chain}` ? "..." : "→"}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setOpen(false)}
              disabled={loading !== null}
              className="w-full text-center py-2 text-sm text-text-secondary hover:text-text"
            >
              Cancel
            </button>

            {error && (
              <p
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: "var(--score-poor)",
                }}
              >
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
