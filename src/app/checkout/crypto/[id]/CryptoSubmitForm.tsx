"use client";

import { useState } from "react";

export function CryptoSubmitForm({ paymentId }: { paymentId: string }) {
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!txHash.trim()) {
      setError("Please enter the transaction hash");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/checkout/crypto/${paymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: txHash.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit");
        setLoading(false);
        return;
      }
      window.location.reload();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={txHash}
        onChange={(e) => setTxHash(e.target.value)}
        placeholder="Transaction hash (e.g., 0x4a3f… or txid)"
        className="w-full px-4 py-2.5 rounded-[12px] border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-engine-conversion font-mono"
        autoFocus
      />
      {error && <p className="text-sm text-score-poor">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-text text-white rounded-[980px] font-medium text-sm hover:bg-black disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit transaction hash"}
      </button>
    </form>
  );
}
